const Invoice = require("../models/Invoice");

exports.createInvoice = async (req, res) => {
    try {
        const { userId, paymentId, amount } = req.body;
        if (!userId || !paymentId || !amount) return res.status(400).json({ message: "Campos obligatorios faltantes." });
        const invoice = await Invoice.create({ userId, paymentId, amount });
        res.status(201).json({ message: "Factura creada.", invoice });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getInvoicesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const invoices = await Invoice.findAll({ where: { userId } });
        res.status(200).json(invoices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
