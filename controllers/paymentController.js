// controllers/paymentController.js

const sendgrid = require("@sendgrid/mail");
const Payment = require("../models/Payment");
const User = require("../models/User");

const {
    getEditionPaymentEmailTemplate,
    getBookPaymentEmailTemplate
} = require("../templates/emailTemplates");

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.createPayment = async (req, res) => {
    try {
        // Campos obligatorios
        const {
            userId,
            amount,
            method,
            // Para determinar el tipo de pago y construir la URL
            editionId,
            bookTitle,
            // Campos opcionales internos
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
            return res.status(400).json({
                message:
                    "Todos los campos obligatorios (userId, amount, method) son requeridos."
            });
        }

        // Crear registro de pago
        const payment = await Payment.create({
            userId,
            amount,
            method,
            status: status ?? "pending",
            paymentDate: paymentDate ?? null,
            approvedBy: approvedBy ?? null,
            invoiced: invoiced ?? false,
            subtotalChapterEdition: subtotalChapterEdition ?? null,
            subtotalChapterOwnBook: subtotalChapterOwnBook ?? null,
            subtotalOwnBook: subtotalOwnBook ?? null,
            subtotalGeneral: subtotalGeneral ?? null,
            paidAmount: paidAmount ?? null,
            paymentProofUrl: paymentProofUrl ?? null,
            adminProofUrl: adminProofUrl ?? null,
            // Si tu modelo Payment admite editionId / bookTitle, inclúyelos aquí:
            editionId: editionId ?? null,
            bookTitle: bookTitle ?? null
        });

        // Recuperar datos de usuario para envío de email
        const user = await User.findByPk(userId);
        if (user) {
            let emailData;

            // Si viene editionId, enviamos plantilla de pago de edición
            if (editionId) {
                const editionUrl = `${process.env.FRONTEND_URL}/editions/${editionId}/books`;
                emailData = getEditionPaymentEmailTemplate(
                    user.firstName,
                    editionId,
                    editionUrl
                );

                // Si viene bookTitle, enviamos plantilla de pago de libro completo
            } else if (bookTitle) {
                const bookUrl = `${process.env.FRONTEND_URL}/books/${encodeURIComponent(
                    bookTitle
                )}`;
                emailData = getBookPaymentEmailTemplate(
                    user.firstName,
                    bookTitle,
                    bookUrl
                );
            }

            // Enviar correo si hemos seleccionado plantilla
            if (emailData) {
                await sendgrid.send({
                    to: user.email,
                    from: {
                        email: process.env.SENDGRID_FROM_EMAIL,
                        name: "Investiga Sanidad"
                    },
                    subject: emailData.subject,
                    html: emailData.html
                });
            }
        }

        res.status(201).json({ message: "Pago registrado.", payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        let payments;
        if (req.query.userId) {
            payments = await Payment.findAll({
                where: { userId: req.query.userId }
            });
        } else {
            payments = await Payment.findAll();
        }
        res.status(200).json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: "Pago no encontrado." });
        }
        res.status(200).json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
