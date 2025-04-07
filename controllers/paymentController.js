const Payment = require("../models/Payment");

exports.createPayment = async (req, res) => {
    try {
        // Se desestructuran los campos obligatorios y opcionales
        const {
            userId,
            amount,
            method,
            // Campos opcionales:
            status,
            paymentDate,
            approvedBy,
            invoiced,
            subtotalChapterEdition,
            subtotalChapterOwnBook,
            subtotalOwnBook,
            subtotalGeneral,
            paidAmount,
            paymentProofUrl,
            adminProofUrl
        } = req.body;

        if (!userId || !amount || !method) {
            return res.status(400).json({ message: "Todos los campos obligatorios (userId, amount, method) son requeridos." });
        }

        const payment = await Payment.create({
            userId,
            amount,
            method,
            status: status || "pending",
            paymentDate: paymentDate || null,
            approvedBy: approvedBy || null,
            invoiced: invoiced !== undefined ? invoiced : false,
            subtotalChapterEdition: subtotalChapterEdition || null,
            subtotalChapterOwnBook: subtotalChapterOwnBook || null,
            subtotalOwnBook: subtotalOwnBook || null,
            subtotalGeneral: subtotalGeneral || null,
            paidAmount: paidAmount || null,
            paymentProofUrl: paymentProofUrl || null,
            adminProofUrl: adminProofUrl || null
        });

        res.status(201).json({ message: "Pago registrado.", payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        let payments;
        if (req.query.userId) {
            payments = await Payment.findAll({ where: { userId: req.query.userId } });
        } else {
            payments = await Payment.findAll();
        }
        res.status(200).json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

