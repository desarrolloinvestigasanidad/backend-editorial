// routes/webhook.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sendgrid = require("@sendgrid/mail");

const Payment = require("../models/Payment");
const User = require("../models/User");
const Book = require("../models/Book");
const ChapterPurchase = require("../models/ChapterPurchase");

const {
    getEditionPaymentEmailTemplate,
    getBookPaymentEmailTemplate
} = require("../templates/emailTemplates");

// Configuramos SendGrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// Helpers para compras de capítulos
async function getPurchasedChapters(userId, editionId) {
    const purchases = await ChapterPurchase.findAll({ where: { userId, editionId } });
    return purchases.reduce((total, p) => total + p.chapterCount, 0);
}

async function registerChapterPurchase(userId, editionId, chapterCount, amountCharged) {
    return ChapterPurchase.create({ userId, editionId, chapterCount, amountCharged });
}

// Tabla de precios (en euros)
const priceTable = { 1: 25, 2: 35, 3: 49, 4: 64, 5: 69, 6: 72, 7: 89, 8: 106 };

router.post(
    "/",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const sig = req.headers["stripe-signature"];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error("Firma webhook inválida:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const metadata = session.metadata || {};
            const userId = metadata.userId;
            const bookTitle = metadata.bookTitle;
            const bookIdMeta = metadata.bookId;
            const chapterCount = parseInt(metadata.chapterCount, 10) || 0;
            const editionId = metadata.editionId;
            const amountTotal = session.amount_total; // en céntimos

            // 1️⃣  Registrar el pago
            const paymentData = {
                userId,
                amount: Number((amountTotal / 100).toFixed(2)),
                method: "Stripe",
                status: "completed",
                paymentDate: new Date(),
            };

            let paymentRecord;
            try {
                paymentRecord = await Payment.create(paymentData);
                console.log("Pago registrado:", paymentRecord.id);
            } catch (err) {
                console.error("Error al registrar pago:", err);
            }

            // 2️⃣  Cargar datos de usuario para el correo
            const user = userId ? await User.findByPk(userId) : null;

            // 3️⃣  Lógica para compra de capítulos vs libro
            if (chapterCount > 0 && editionId) {
                // Compra de capítulos
                let previous = await getPurchasedChapters(userId, editionId);
                const cumulative = previous + chapterCount;
                const prevPrice = previous ? priceTable[previous] : 0;
                const cumPrice = priceTable[cumulative];
                const toCharge = cumPrice - prevPrice;

                try {
                    const cp = await registerChapterPurchase(
                        userId,
                        editionId,
                        chapterCount,
                        toCharge.toFixed(2)
                    );
                    console.log("Compra de capítulos registrada:", cp.id);
                } catch (err) {
                    console.error("Error al registrar compra de capítulos:", err);
                }

                // 4️⃣  Enviar correo de pago de edición
                if (user) {
                    const editionUrl = `${process.env.FRONTEND_URL}/editions/${editionId}/books`;
                    const emailData = getEditionPaymentEmailTemplate(
                        user.firstName,
                        editionId,
                        editionUrl
                    );
                    try {
                        await sendgrid.send({
                            to: user.email,
                            from: {
                                email: process.env.SENDGRID_FROM_EMAIL,
                                name: "Investiga Sanidad"
                            },
                            subject: emailData.subject,
                            html: emailData.html,
                        });
                        console.log("Email de pago de edición enviado a", user.email);
                    } catch (err) {
                        console.error("Error enviando email de pago de edición:", err);
                    }
                }

            } else {
                // Compra de libro personalizado
                let newBook;
                if (userId && bookTitle) {
                    try {
                        newBook = await Book.create({
                            editionId: null,
                            title: bookTitle,
                            price: (amountTotal / 100).toFixed(2),
                            bookType: "libro propio",
                            status: "borrador",
                            active: true,
                            authorId: userId,
                        });
                        console.log("Libro propio creado (borrador):", newBook.id);
                    } catch (err) {
                        console.error("Error creando libro propio:", err);
                    }
                }

                // 4️⃣  Enviar correo de pago de libro propio
                if (user && newBook) {
                    const bookUrl = `${process.env.FRONTEND_URL}/books/${newBook.id}`;
                    const emailData = getBookPaymentEmailTemplate(
                        user.firstName,
                        bookTitle,
                        bookUrl
                    );
                    try {
                        await sendgrid.send({
                            to: user.email,
                            from: {
                                email: process.env.SENDGRID_FROM_EMAIL,
                                name: "Investiga Sanidad"
                            },
                            subject: emailData.subject,
                            html: emailData.html,
                        });
                        console.log("Email de pago de libro enviado a", user.email);
                    } catch (err) {
                        console.error("Error enviando email de pago de libro:", err);
                    }
                }
            }
        } else {
            console.log(`Evento no manejado: ${event.type}`);
        }

        // Respondemos rápido al webhook
        res.json({ received: true });
    }
);

module.exports = router;
