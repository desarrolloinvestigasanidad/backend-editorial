const Template = require("../models/Template");

// Crear una nueva plantilla
exports.createTemplate = async (req, res) => {
    try {
        const { type, content, description } = req.body;
        // Validación: se requiere tipo y contenido
        if (!type || !content) {
            return res.status(400).json({ message: "Tipo y contenido son obligatorios." });
        }
        // Crear la plantilla en la base de datos
        const template = await Template.create({ type, content, description });
        res.status(201).json({ message: "Plantilla creada.", template });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener todas las plantillas
exports.getTemplates = async (req, res) => {
    try {
        const templates = await Template.findAll();
        res.status(200).json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
