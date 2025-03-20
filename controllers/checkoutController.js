// controllers/checkoutController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
    try {
        // Desestructuramos las propiedades del body
        const { userId, bookTitle, amount, bookId } = req.body;

        // Validamos solo los campos obligatorios: userId, bookTitle y amount
        if (!userId || !bookTitle || !amount) {
            return res.status(400).json({ message: "Faltan datos requeridos (userId, bookTitle, amount)" });
        }

        // Crea la sesión de checkout en Stripe, enviando bookId como cadena vacía si no existe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "Libro Personalizado",
                        },
                        unit_amount: parseInt(amount * 100), // convierte a céntimos
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:3000/cancel",
            metadata: {
                userId,
                bookTitle,
                bookId: bookId || "" // Si no se envía bookId, se asigna cadena vacía
            },
        });

        // Devuelve la URL de la sesión para redirigir al usuario
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Error creando la sesión de Checkout:", error);
        res.status(500).json({ error: error.message });
    }
};
