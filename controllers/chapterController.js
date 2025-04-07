const Chapter = require("../models/Chapter");
const ChapterPurchase = require("../models/ChapterPurchase");

// Crear un capítulo dentro de un libro (anidado en una edición)
exports.createChapterForBook = async (req, res) => {
    try {
        const { editionId, bookId } = req.params;
        const {
            title,
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            authorId,
        } = req.body;
        if (
            !title ||
            !studyType ||
            !methodology ||
            !introduction ||
            !objectives ||
            !results ||
            !discussion ||
            !bibliography ||
            !authorId
        ) {
            return res.status(400).json({ message: "Faltan campos obligatorios para el capítulo." });
        }
        const newChapter = await Chapter.create({
            title,
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            bookId,
            editionId,
            authorId,
            content: introduction, // ejemplo de lógica para content
        });
        res.status(201).json({ message: "Capítulo creado.", chapter: newChapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Listar capítulos de un libro (anidados)
exports.getChaptersForBook = async (req, res) => {
    try {
        const { editionId, bookId } = req.params;
        // Se asume que ya se verificó la existencia del libro
        const chapters = await Chapter.findAll({ where: { bookId } });
        res.status(200).json(chapters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un capítulo concreto (anidado)
exports.getOneChapterForBook = async (req, res) => {
    try {
        const { editionId, bookId, chapterId } = req.params;
        const chapter = await Chapter.findOne({ where: { id: chapterId, bookId } });
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        res.status(200).json(chapter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un capítulo (anidado)
exports.updateChapterForBook = async (req, res) => {
    try {
        const { editionId, bookId, chapterId } = req.params;
        const { title, studyType, methodology, introduction, objectives, results, discussion, bibliography, status } = req.body;
        const chapter = await Chapter.findOne({ where: { id: chapterId, bookId } });
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        await chapter.update({ title, studyType, methodology, introduction, objectives, results, discussion, bibliography, status });
        res.status(200).json({ message: "Capítulo actualizado.", chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un capítulo (anidado)
exports.deleteChapterForBook = async (req, res) => {
    try {
        const { editionId, bookId, chapterId } = req.params;
        const chapter = await Chapter.findOne({ where: { id: chapterId, bookId } });
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        await chapter.destroy();
        res.status(200).json({ message: "Capítulo eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Funciones adicionales (para revisión o créditos) se mantienen sin cambio
exports.reviewChapter = async (req, res) => {
    try {
        const { id } = req.params; // aquí 'id' se refiere al capítulo (puedes renombrarlo a chapterId para mayor claridad)
        const { status } = req.body;
        const chapter = await Chapter.findByPk(id);
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        await chapter.update({ status });
        res.status(200).json({ message: `Capítulo ${status}.`, chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getChapterCredits = async (req, res) => {
    try {
        const { userId, editionId } = req.params;
        const purchases = await ChapterPurchase.findAll({ where: { userId, editionId } });
        const total = purchases.reduce((sum, purchase) => sum + purchase.chapterCount, 0);
        res.status(200).json({ creditos: total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAvailableChapterCredits = async (req, res) => {
    try {
        const { userId, editionId } = req.params;
        const purchases = await ChapterPurchase.findAll({ where: { userId, editionId } });
        const totalPurchased = purchases.reduce((sum, purchase) => sum + purchase.chapterCount, 0);
        const chaptersCreated = await Chapter.count({ where: { authorId: userId, editionId } });
        const available = totalPurchased - chaptersCreated;
        res.status(200).json({ available });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
