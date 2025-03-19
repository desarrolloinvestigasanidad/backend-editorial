const Certificate = require("../models/Certificate");

// Genera un certificado para un usuario
exports.generateCertificate = async (req, res) => {
    try {
        const { userId, type, content } = req.body;
        // Validación de campos obligatorios
        if (!userId || !type || !content) {
            return res.status(400).json({ message: "Campos obligatorios faltantes." });
        }
        // Se crea el certificado. El campo 'status' se establecerá por defecto (por ejemplo, "generated")
        const certificate = await Certificate.create({ userId, type, content });
        res.status(201).json({ message: "Certificado generado.", certificate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtiene todos los certificados de un usuario específico
exports.getCertificatesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const certificates = await Certificate.findAll({ where: { userId } });
        res.status(200).json(certificates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
