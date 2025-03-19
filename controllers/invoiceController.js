const Invoice = require("../models/Invoice");

exports.createInvoice = async (req, res) => {
    try {
        const {
            userId,
            paymentId,
            amount,
            invoiceCode,
            units,
            description,
            discount,
            paymentDate,
            status,
            pdfUrl
        } = req.body;

        // Validación de campos obligatorios
        if (!userId || !paymentId || !amount) {
            return res.status(400).json({ message: "Campos obligatorios faltantes: userId, paymentId y amount." });
        }

        // Crear factura usando los campos opcionales si están presentes
        const invoice = await Invoice.create({
            userId,
            paymentId,
            amount,
            invoiceCode: invoiceCode || null,
            units: units || null,
            description: description || null,
            discount: discount || null,
            paymentDate: paymentDate || null,
            status: status || "paid",
            pdfUrl: pdfUrl || null
        });

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
