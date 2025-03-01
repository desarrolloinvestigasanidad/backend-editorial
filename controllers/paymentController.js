const Payment = require("../models/Payment");

exports.createPayment = async (req, res) => {
    try {
        const { userId, amount, method } = req.body;
        if (!userId || !amount || !method) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }
        const payment = await Payment.create({ userId, amount, method });
        res.status(201).json({ message: "Pago registrado.", payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll();
        res.status(200).json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
