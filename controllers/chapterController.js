const Chapter = require("../models/Chapter");

exports.createChapter = async (req, res) => {
    try {
        // Extraemos todos los campos requeridos según el nuevo modelo
        const {
            title,
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            bookId,
            authorId,
        } = req.body;

        // Validación de campos obligatorios
        if (
            !title ||
            !studyType ||
            !methodology ||
            !introduction ||
            !objectives ||
            !results ||
            !discussion ||
            !bibliography ||
            !bookId ||
            !authorId
        ) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        // Crear el capítulo con los datos recibidos
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
            authorId,
        });

        res.status(201).json({ message: "Capítulo creado.", chapter: newChapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reviewChapter = async (req, res) => {
    try {
        const { id } = req.params;
        // Se espera que status sea, por ejemplo, "aprobado" o "rechazado"
        const { status } = req.body;
        const chapter = await Chapter.findByPk(id);
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        await chapter.update({ status });
        res.status(200).json({ message: `Capítulo ${status}.`, chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
