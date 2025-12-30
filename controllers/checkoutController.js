// controllers/checkoutController.js
// Stripe es opcional - solo se inicializa si hay API key
const stripe = process.env.STRIPE_SECRET_KEY
    ? require("stripe")(process.env.STRIPE_SECRET_KEY)
    : null;

const Book = require("../models/Book");
const Payment = require("../models/Payment");
const { v4: uuidv4 } = require("uuid");

// Variable para saber si Stripe está habilitado
const STRIPE_ENABLED = !!stripe;

exports.createCheckoutSession = async (req, res) => {
    try {
        // Desestructuramos las propiedades del body y también de metadata
        const {
            userId,
            bookTitle,
            amount,
            bookId,
            metadata,
            chapterCount: chapterCountTop,
            editionId: editionIdTop,
        } = req.body;

        // Extraemos chapterCount y editionId, priorizando el nivel superior
        const chapterCount = chapterCountTop || (metadata && metadata.chapterCount);
        const editionId = editionIdTop || (metadata && metadata.editionId);

        // Validamos los campos obligatorios para cualquier compra
        if (!userId || !bookTitle || !amount) {
            return res
                .status(400)
                .json({ message: "Faltan datos requeridos (userId, bookTitle, amount)" });
        }

        // Si Stripe NO está configurado, simular el pago y crear el libro directamente
        if (!STRIPE_ENABLED) {
            console.log('Stripe no configurado - simulando pago exitoso para:', bookTitle);

            // Crear el libro directamente
            const newBook = await Book.create({
                title: bookTitle,
                authorId: userId,
                bookType: "libro propio",
                status: "borrador",
                active: true,
                price: amount / 100, // Convertir de céntimos a euros
            });

            // Crear el pago simulado para que el sidebar muestre las opciones
            const amountInEuros = amount / 100;
            await Payment.create({
                userId: userId,
                amount: amountInEuros,
                method: "simulated",
                status: "completed",
                paymentDate: new Date(),
                subtotalOwnBook: amountInEuros,
                paidAmount: amountInEuros,
            });
            console.log('Pago simulado creado para usuario:', userId, 'cantidad:', amountInEuros);

            // Generar un sessionId simulado
            const fakeSessionId = `sim_${uuidv4()}`;

            // Redirigir a success con el sessionId simulado
            const successUrl = `${process.env.FRONTEND_URL}/success?session_id=${fakeSessionId}&simulated=true&bookId=${newBook.id}`;

            return res.status(200).json({ url: successUrl });
        }

        // Determinamos el nombre del producto según si se envían chapterCount y editionId
        const productName =
            chapterCount && editionId ? "Compra de Capítulos" : "Libro Personalizado";

        // Creamos la sesión de checkout en Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card", "sepa_debit"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: productName,
                        },
                        // Si amount ya viene en céntimos, no se debe multiplicar.
                        // Ajusta esto según tu convención. Aquí asumimos que amount es ya el valor en céntimos.
                        unit_amount: parseInt(amount, 10),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            locale: 'es',
            metadata: {
                userId,
                bookTitle,
                bookId: bookId || "", // Si no se envía bookId, se asigna cadena vacía
                chapterCount: chapterCount ? chapterCount.toString() : "",
                editionId: editionId || "",
            },
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Error creando la sesión de Checkout:", error);
        res.status(500).json({ error: error.message });
    }
};
// controllers/checkoutController.js
exports.getCheckoutSession = async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId) {
        return res.status(400).json({ message: "Falta sessionId" });
    }

    // Si es una sesión simulada, devolver datos simulados
    if (sessionId.startsWith('sim_')) {
        return res.status(200).json({
            session: {
                id: sessionId,
                payment_status: 'paid',
                status: 'complete',
                metadata: {},
                simulated: true
            }
        });
    }

    // Si Stripe no está configurado y no es simulada, error
    if (!stripe) {
        return res.status(503).json({ error: "Stripe no está configurado." });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.status(200).json({ session });
    } catch (err) {
        console.error("Error al recuperar la sesión:", err);
        res.status(500).json({ error: err.message });
    }
};
