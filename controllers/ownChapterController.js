// backend-editorial\controllers\ownChapterController.js

const Chapter = require("../models/Chapter");
const ChapterPurchase = require("../models/ChapterPurchase");

// Obtener todos los capítulos propios (sin editionId ni bookId)
exports.getAllOwnChapters = async (req, res) => {
    try {
        const { authorId, bookId } = req.query;
        // Construyo dinámicamente el filtro
        const where = {};
        if (authorId) where.authorId = authorId;
        if (bookId) where.bookId = bookId;

        const chapters = await Chapter.findAll({ where });
        res.status(200).json(chapters);
    } catch (err) {
        console.error("Error en getAllOwnChapters:", err); // Añadido para mejor depuración
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
        console.error("Error en getOneOwnChapter:", err); // Añadido para mejor depuración
        res.status(500).json({ error: err.message });
    }
};

// Crear un capítulo propio
exports.createOwnChapter = async (req, res) => {
    try {
        const { title, studyType, methodology, introduction, objectives, results, discussion, bibliography, authorId, bookId } = req.body;
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
            bookId, // Asegúrate que bookId puede ser null si el capítulo no está asociado a un libro inicialmente
            status: "pendiente", // O el estado inicial que prefieras
            rejectionReason: null // Inicialmente no hay motivo de rechazo
        });
        res.status(201).json({ message: "Capítulo propio creado.", chapter: newChapter });
    } catch (err) {
        console.error("Error en createOwnChapter:", err); // Añadido para mejor depuración
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un capítulo propio
exports.updateOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        // Extraemos todos los campos del body, incluyendo rejectionReason
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
            rejectionReason // <-- AÑADIDO AQUÍ para recibirlo del body
        } = req.body;

        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Capítulo no encontrado." });
        }

        // Creamos el objeto con los datos a actualizar
        const dataToUpdate = {
            title,
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            status,
            // Lógica para rejectionReason:
            // Si el nuevo estado es "rechazado", guarda el rejectionReason.
            // Si no, establece rejectionReason a null (para limpiar un motivo anterior).
            rejectionReason: status === "rechazado" ? rejectionReason : null
        };

        await chapter.update(dataToUpdate); // Usamos el objeto dataToUpdate

        res.status(200).json({ message: "Capítulo propio actualizado.", chapter });
    } catch (err) {
        console.error("Error en updateOwnChapter:", err); // Añadido para mejor depuración
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un capítulo propio
exports.deleteOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Capítulo no encontrado." });
        }
        await chapter.destroy();
        res.status(200).json({ message: "Capítulo propio eliminado." });
    } catch (err) {
        console.error("Error en deleteOwnChapter:", err); // Añadido para mejor depuración
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

        res.status(200).json({ chapter_purchases: purchases }); // Modificado para que coincida con el frontend si es necesario
    } catch (err) {
        console.error("Error fetching chapter purchases:", err);
        res.status(500).json({ error: err.message });
    }
};
