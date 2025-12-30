// controllers/checkoutController.js
// Stripe es opcional - solo se inicializa si hay API key
const stripe = process.env.STRIPE_SECRET_KEY
    ? require("stripe")(process.env.STRIPE_SECRET_KEY)
    : null;

exports.createCheckoutSession = async (req, res) => {
    try {
        // Verificar si Stripe está configurado
        if (!stripe) {
            return res.status(503).json({
                error: "Stripe no está configurado. Contacte al administrador."
            });
        }

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
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.status(200).json({ session });
    } catch (err) {
        console.error("Error al recuperar la sesión:", err);
        res.status(500).json({ error: err.message });
    }
};
