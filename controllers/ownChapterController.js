const Chapter = require("../models/Chapter");
const ChapterPurchase = require("../models/ChapterPurchase");

// Obtener todos los capítulos propios (sin editionId ni bookId)
exports.getAllOwnChapters = async (req, res) => {
    try {
        let chapters;
        // Si se pasa authorId, se filtran por ese autor
        if (req.query.authorId) {
            chapters = await Chapter.findAll({ where: { authorId: req.query.authorId } });
        } else {
            // Sino, retorna todos los capítulos
            chapters = await Chapter.findAll();
        }
        res.status(200).json(chapters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Obtener un capítulo propio por su id
exports.getOneOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        res.status(200).json(chapter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un capítulo propio
exports.createOwnChapter = async (req, res) => {
    try {
        const { title, studyType, methodology, introduction, objectives, results, discussion, bibliography, authorId } = req.body;
        if (!title || !studyType || !methodology || !introduction || !objectives || !results || !discussion || !bibliography || !authorId) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
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
            authorId,
            editionId: null,
            bookId,
            status: "pendiente",
        });
        res.status(201).json({ message: "Capítulo propio creado.", chapter: newChapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un capítulo propio
exports.updateOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { title, studyType, methodology, introduction, objectives, results, discussion, bibliography, status } = req.body;
        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        await chapter.update({ title, studyType, methodology, introduction, objectives, results, discussion, bibliography, status });
        res.status(200).json({ message: "Capítulo propio actualizado.", chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un capítulo propio
exports.deleteOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        await chapter.destroy();
        res.status(200).json({ message: "Capítulo propio eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.listChapterPurchases = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "Missing userId query parameter." });
        }

        const purchases = await ChapterPurchase.findAll({
            where: { userId },
        });

        // wrap in the same shape your front-end expects
        res.status(200).json({ chapter_purchases: purchases });
    } catch (err) {
        console.error("Error fetching chapter purchases:", err);
        res.status(500).json({ error: err.message });
    }
};