const Edition = require("../models/Edition");

exports.createEdition = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "El nombre es obligatorio." });
        const newEdition = await Edition.create({ name, description });
        res.status(201).json({ message: "Edición creada.", edition: newEdition });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEditions = async (req, res) => {
    try {
        const editions = await Edition.findAll();
        res.status(200).json(editions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

exports.updateEdition = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const edition = await Edition.findByPk(id);
        if (!edition) return res.status(404).json({ message: "Edición no encontrada." });
        await edition.update({ name, description });
        res.status(200).json({ message: "Edición actualizada.", edition });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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
