const Edition = require("../models/Edition");

// Crear una edición
exports.createEdition = async (req, res) => {
    try {
        // Extraemos los campos nuevos
        const {
            title,
            subtitle,
            year,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            normativa,
            description
        } = req.body;

        if (!title) {
            return res.status(400).json({ message: "El título es obligatorio." });
        }

        const newEdition = await Edition.create({
            title,
            subtitle: subtitle || null,
            year: year || null,
            cover: cover || null,
            openDate: openDate || null,
            deadlineChapters: deadlineChapters || null,
            publishDate: publishDate || null,
            normativa: normativa || null,
            description: description || null
        });

        res.status(201).json({ message: "Edición creada.", edition: newEdition });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Listar todas las ediciones
exports.getEditions = async (req, res) => {
    try {
        const editions = await Edition.findAll();
        res.status(200).json(editions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener una edición en específico
exports.getEdition = async (req, res) => {
    try {
        const { id } = req.params;
        const edition = await Edition.findByPk(id);
        if (!edition) return res.status(404).json({ message: "Edición no encontrada." });
        res.status(200).json(edition);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar una edición
exports.updateEdition = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            subtitle,
            year,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            normativa,
            description
        } = req.body;

        const edition = await Edition.findByPk(id);
        if (!edition) return res.status(404).json({ message: "Edición no encontrada." });

        await edition.update({
            title,
            subtitle,
            year,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            normativa,
            description
        });
        res.status(200).json({ message: "Edición actualizada.", edition });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar una edición
exports.deleteEdition = async (req, res) => {
    try {
        const { id } = req.params;
        const edition = await Edition.findByPk(id);
        if (!edition) return res.status(404).json({ message: "Edición no encontrada." });

        await edition.destroy();
        res.status(200).json({ message: "Edición eliminada." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
