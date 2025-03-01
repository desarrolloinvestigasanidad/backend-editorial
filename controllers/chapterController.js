const Chapter = require("../models/Chapter");

exports.createChapter = async (req, res) => {
    try {
        const { title, content, bookId, authorId } = req.body;
        if (!title || !content || !bookId || !authorId) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }
        const newChapter = await Chapter.create({ title, content, bookId, authorId });
        res.status(201).json({ message: "Capítulo creado.", chapter: newChapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reviewChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // “approved” o “rejected”
        const chapter = await Chapter.findByPk(id);
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        await chapter.update({ status });
        res.status(200).json({ message: `Capítulo ${status}.`, chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
