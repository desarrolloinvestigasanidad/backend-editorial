const Chapter = require("../models/Chapter");
const ChapterPurchase = require("../models/ChapterPurchase");
const CreditHistory = require("../models/CreditHistory"); // Nuevo modelo

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
            return res.status(400).json({
                message: "Faltan campos obligatorios para el capítulo.",
            });
        }

        // 1. Verificar si el usuario tiene créditos disponibles
        const purchases = await ChapterPurchase.findAll({
            where: { userId: authorId, editionId },
        });

        const totalPurchased = purchases.reduce(
            (sum, purchase) => sum + purchase.chapterCount,
            0
        );

        const chaptersCreated = await Chapter.count({
            where: { authorId, editionId },
        });

        const availableCredits = totalPurchased - chaptersCreated;

        if (availableCredits <= 0) {
            return res.status(400).json({
                message: "No tienes créditos disponibles para enviar un capítulo.",
            });
        }

        // 2. Crear el capítulo
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
            content: introduction,
            status: 'pendiente',  // Puedes luego mejorar este campo si lo deseas
        });

        // 3. Registrar el historial de consumo de crédito
        await CreditHistory.create({
            userId: authorId,
            editionId,
            type: "chapter_submission",
            description: `Consumo de crédito por envío del capítulo "${title}".`,
        });

        return res
            .status(201)
            .json({ message: "Capítulo creado correctamente.", chapter: newChapter });
    } catch (err) {
        console.error("Error al crear capítulo:", err);
        return res.status(500).json({ error: err.message });
    }
};

// Listar capítulos de un libro (anidados)
exports.getChaptersForBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const chapters = await Chapter.findAll({ where: { bookId } });
        res.status(200).json(chapters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un capítulo concreto (anidado)
exports.getOneChapterForBook = async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;
        const chapter = await Chapter.findOne({ where: { id: chapterId, bookId } });
        if (!chapter)
            return res.status(404).json({ message: "Capítulo no encontrado." });
        res.status(200).json(chapter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un capítulo (anidado)
exports.updateChapterForBook = async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;
        const {
            title,
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            status,
        } = req.body;

        const chapter = await Chapter.findOne({ where: { id: chapterId, bookId } });
        if (!chapter)
            return res.status(404).json({ message: "Capítulo no encontrado." });

        await chapter.update({
            title,
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            status,
        });

        res.status(200).json({ message: "Capítulo actualizado.", chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un capítulo (anidado)
exports.deleteChapterForBook = async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;
        const chapter = await Chapter.findOne({ where: { id: chapterId, bookId } });
        if (!chapter)
            return res.status(404).json({ message: "Capítulo no encontrado." });

        await chapter.destroy();
        res.status(200).json({ message: "Capítulo eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Revisar estado de capítulo
exports.reviewChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const chapter = await Chapter.findByPk(id);
        if (!chapter)
            return res.status(404).json({ message: "Capítulo no encontrado." });

        await chapter.update({ status });

        res
            .status(200)
            .json({ message: `Capítulo actualizado a estado: ${status}.`, chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener créditos totales adquiridos
exports.getChapterCredits = async (req, res) => {
    try {
        const { userId, editionId } = req.params;

        const purchases = await ChapterPurchase.findAll({
            where: { userId, editionId },
        });

        const total = purchases.reduce(
            (sum, purchase) => sum + purchase.chapterCount,
            0
        );

        res.status(200).json({ creditos: total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener créditos disponibles
exports.getAvailableChapterCredits = async (req, res) => {
    try {
        const { userId, editionId } = req.params;

        const purchases = await ChapterPurchase.findAll({
            where: { userId, editionId },
        });

        const totalPurchased = purchases.reduce(
            (sum, purchase) => sum + purchase.chapterCount,
            0
        );

        const chaptersCreated = await Chapter.count({
            where: { authorId: userId, editionId },
        });

        const available = totalPurchased - chaptersCreated;

        res.status(200).json({ available });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getChaptersForUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { editionId } = req.query;
        if (!editionId) {
            return res.status(400).json({ message: "Falta el parámetro editionId" });
        }

        const chapters = await Chapter.findAll({
            where: { authorId: userId, editionId },
            order: [["createdAt", "ASC"]],
        });
        res.json(chapters);
    } catch (err) {
        next(err);
    }
};
