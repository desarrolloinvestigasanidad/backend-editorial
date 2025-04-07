// routes/webhook.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const Book = require("../models/Book");
const ChapterPurchase = require("../models/ChapterPurchase");

// Función para obtener la cantidad de capítulos ya comprados para un usuario en una edición
async function getPurchasedChapters(userId, editionId) {
    const purchases = await ChapterPurchase.findAll({ where: { userId, editionId } });
    return purchases.reduce((total, purchase) => total + purchase.chapterCount, 0);
}

// Función para registrar la compra de capítulos
async function registerChapterPurchase(userId, editionId, chapterCount, amountCharged) {
    return ChapterPurchase.create({
        userId,
        editionId,
        chapterCount,
        amountCharged,
    });
}

// Tabla de precios de participación en capítulos (en euros)
const priceTable = {
    1: 25,
    2: 35,
    3: 49,
    4: 64,
    5: 69,
    6: 72,
    7: 89,
    8: 106,
};

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
            console.error("Error validando la firma del webhook:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                console.log("Checkout Session completada:", session);

                // Extraemos la metadata enviada al crear la sesión
                // Se espera que se envíen al menos: userId y bookTitle
                // Para compras de capítulos se debe enviar también: editionId y chapterCount
                const { userId, bookTitle, bookId, chapterCount, editionId } = session.metadata || {};
                const amountReceived = session.amount_total; // en céntimos

                // Registrar el pago en la tabla Payment (aplica para ambas compras)
                const paymentData = {
                    userId,
                    amount: Number((amountReceived / 100).toFixed(2)), // convertir a número
                    method: "Stripe",
                    status: "completed",
                    paymentDate: new Date(),
                };


                try {
                    const paymentRecord = await Payment.create(paymentData);
                    console.log("Pago registrado en la BBDD:", paymentRecord);
                } catch (error) {
                    console.error("Error registrando el pago en la BBDD:", error);
                }

                // Si se envía chapterCount, se asume que se trata de una compra de capítulos
                if (chapterCount && editionId) {
                    const currentPurchase = parseInt(chapterCount, 10);
                    if (isNaN(currentPurchase) || currentPurchase < 1) {
                        console.error("Valor inválido para chapterCount.");
                        break;
                    }
                    // Obtener los capítulos ya comprados
                    let purchasedBefore = await getPurchasedChapters(userId, editionId);
                    purchasedBefore = purchasedBefore || 0;
                    const cumulative = purchasedBefore + currentPurchase;
                    if (cumulative > 8) {
                        console.error("El total de capítulos supera el máximo permitido (8).");
                        // Aquí podrías iniciar una acción de reversión o reembolso
                        break;
                    }
                    // Calcular el precio acumulado y el precio a cobrar para la compra actual
                    const cumulativePrice = priceTable[cumulative];
                    const previousPrice = purchasedBefore > 0 ? priceTable[purchasedBefore] : 0;
                    const amountToCharge = cumulativePrice - previousPrice;
                    console.log(`Capítulos previos: ${purchasedBefore}, compra actual: ${currentPurchase}, total: ${cumulative}`);
                    console.log(`Precio acumulado: ${cumulativePrice}€, precio previo: ${previousPrice}€, cobrar: ${amountToCharge}€`);

                    // Validar que el monto cobrado en el Payment Intent (en euros) coincide (opcional)
                    const amountInEuros = amountReceived / 100;
                    if (Math.abs(amountInEuros - amountToCharge) > 0.01) {
                        console.warn(`Monto cobrado (${amountInEuros}€) no coincide con el precio calculado (${amountToCharge}€).`);
                    }

                    // Registrar la compra de capítulos
                    try {
                        const chapterPurchaseRecord = await registerChapterPurchase(
                            userId,
                            editionId,
                            currentPurchase,
                            amountToCharge.toFixed(2)
                        );
                        console.log("Compra de capítulos registrada:", chapterPurchaseRecord);
                    } catch (error) {
                        console.error("Error registrando la compra de capítulos:", error);
                    }
                } else {
                    // Si no se envía chapterCount, se asume que es la compra de un libro único
                    if (userId && bookTitle) {
                        try {
                            const newBook = await Book.create({
                                editionId: null, // Libro propio
                                title: bookTitle,
                                price: (amountReceived / 100).toFixed(2),
                                bookType: "libro propio",
                                status: "desarrollo",
                                active: true,
                                authorId: userId,
                            });
                            console.log("Libro creado en borrador:", newBook);
                        } catch (error) {
                            console.error("Error al crear el libro en borrador:", error);
                        }
                    } else {
                        console.warn("No se recibieron los campos necesarios (userId o bookTitle) en la metadata.");
                    }
                }
                break;
            }

            case "payment_intent.succeeded":
                console.log("Payment Intent succeeded:", event.data.object);
                break;

            default:
                console.log(`Evento no manejado: ${event.type}`);
        }

        res.json({ received: true });
    }
);

module.exports = router;
