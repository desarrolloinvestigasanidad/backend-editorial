const Chapter = require("../models/Chapter");
const ChapterPurchase = require("../models/ChapterPurchase");
const CreditHistory = require("../models/CreditHistory");
const ChapterAuthor = require("../models/ChapterAuthor");
const User = require("../models/User");

// Crear un capítulo dentro de un libro (anidado en una edición)
exports.createChapterForBook = async (req, res, next) => {
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

        // Validación de campos
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
            return res
                .status(400)
                .json({ message: "Faltan campos obligatorios para el capítulo." });
        }

        // 1. Verificar créditos disponibles
        const purchases = await ChapterPurchase.findAll({
            where: { userId: authorId, editionId },
        });
        const totalPurchased = purchases.reduce(
            (sum, p) => sum + p.chapterCount,
            0
        );
        const chaptersCreated = await Chapter.count({
            where: { authorId, editionId },
        });
        if (totalPurchased - chaptersCreated <= 0) {
            return res.status(400).json({
                message: "No tienes créditos disponibles para enviar un capítulo.",
            });
        }

        // 2. Crear capítulo
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
            status: "pendiente",
        });

        // 3. Registrar historial de consumo
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
        next(err);
    }
};

// Listar capítulos de un libro (anidados)
exports.getChaptersForBook = async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const chapters = await Chapter.findAll({ where: { bookId } });
        res.status(200).json(chapters);
    } catch (err) {
        next(err);
    }
};

// Obtener un capítulo concreto (anidado)
exports.getOneChapterForBook = async (req, res, next) => {
    try {
        const { bookId, chapterId } = req.params;
        const chapter = await Chapter.findOne({
            where: { id: chapterId, bookId },
        });
        if (!chapter) {
            return res.status(404).json({ message: "Capítulo no encontrado." });
        }
        res.status(200).json(chapter);
    } catch (err) {
        next(err);
    }
};

// Actualizar un capítulo (anidado)
exports.updateChapterForBook = async (req, res, next) => {
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

        const chapter = await Chapter.findOne({
            where: { id: chapterId, bookId },
        });
        if (!chapter) {
            return res.status(404).json({ message: "Capítulo no encontrado." });
        }

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
        next(err);
    }
};

// Eliminar un capítulo (anidado)
exports.deleteChapterForBook = async (req, res, next) => {
    try {
        const { bookId, chapterId } = req.params;
        const chapter = await Chapter.findOne({
            where: { id: chapterId, bookId },
        });
        if (!chapter) {
            return res.status(404).json({ message: "Capítulo no encontrado." });
        }
        await chapter.destroy();
        res.status(200).json({ message: "Capítulo eliminado." });
    } catch (err) {
        next(err);
    }
};

// Revisar estado de capítulo
exports.reviewChapter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const chapter = await Chapter.findByPk(id);
        if (!chapter) {
            return res.status(404).json({ message: "Capítulo no encontrado." });
        }
        await chapter.update({ status });
        res
            .status(200)
            .json({ message: `Capítulo actualizado a estado: ${status}.`, chapter });
    } catch (err) {
        next(err);
    }
};

// Obtener créditos totales adquiridos
exports.getChapterCredits = async (req, res, next) => {
    try {
        const { userId, editionId } = req.params;
        const purchases = await ChapterPurchase.findAll({
            where: { userId, editionId },
        });
        const total = purchases.reduce((sum, p) => sum + p.chapterCount, 0);
        res.status(200).json({ creditos: total });
    } catch (err) {
        next(err);
    }
};

// Obtener créditos disponibles
exports.getAvailableChapterCredits = async (req, res, next) => {
    try {
        const { userId, editionId } = req.params;
        const purchases = await ChapterPurchase.findAll({
            where: { userId, editionId },
        });
        const totalPurchased = purchases.reduce((sum, p) => sum + p.chapterCount, 0);
        const chaptersCreated = await Chapter.count({
            where: { authorId: userId, editionId },
        });
        res.status(200).json({ available: totalPurchased - chaptersCreated });
    } catch (err) {
        next(err);
    }
};

// Listar capítulos de un usuario en una edición
exports.getChaptersForUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { editionId } = req.query;
        if (!editionId) {
            return res
                .status(400)
                .json({ message: "Falta el parámetro editionId" });
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

// Añadir autor a un capítulo
exports.addAuthorToChapter = async (req, res, next) => {
    try {
        const { chapterId } = req.params;
        const { userId, order = 0 } = req.body;
        await ChapterAuthor.create({ chapterId, userId, order });
        res.status(201).json({ message: "Autor añadido al capítulo" });
    } catch (err) {
        next(err);
    }
};

// Listar autores de un capítulo
exports.getChapterAuthors = async (req, res, next) => {
    try {
        const chapter = await Chapter.findByPk(req.params.chapterId, {
            include: [{ model: User, as: "authors" }],
        });
        res.json(chapter.authors);
    } catch (err) {
        next(err);
    }
};
