// routes/webhook.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const Book = require("../models/Book");

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
            // Manejo del Checkout Session completado
            case "checkout.session.completed": {
                const session = event.data.object;
                console.log("Checkout Session completada:", session);

                // Extraer metadata enviada al crear la sesión
                const { userId, bookTitle, bookId } = session.metadata || {};
                const amountReceived = session.amount_total; // monto en céntimos

                // Registrar el pago en la BBDD
                const paymentData = {
                    userId,
                    amount: (amountReceived / 100).toFixed(2), // convertir a euros
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

                // Crear el libro en borrador, asumiendo bookType "propio"
                if (userId && bookTitle) {
                    try {
                        const newBook = await Book.create({
                            editionId: null, // o asigna un valor si corresponde
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
                    console.warn("No se recibieron userId o bookTitle en el metadata.");
                }
                break;
            }

            // Puedes mantener otros casos de eventos si los necesitas
            case "payment_intent.succeeded":
                // Este evento se recibirá pero es posible que su metadata esté vacía
                console.log("Payment Intent succeeded:", event.data.object);
                break;

            default:
                console.log(`Evento no manejado: ${event.type}`);
        }

        res.json({ received: true });
    }
);

module.exports = router;
