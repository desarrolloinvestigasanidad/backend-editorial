// controllers/bookController.js
const Book = require("../models/Book");
const Edition = require("../models/Edition");
const Chapter = require("../models/Chapter");

// ========================
// Libros en Edición
// ========================

// Crear un libro dentro de una edición
exports.createBookForEdition = async (req, res) => {
    try {
        const { id: editionId } = req.params; // "id" es editionId
        // Se esperan los campos nuevos; los que sean obligatorios los validamos (por ejemplo, title, authorId y price)
        const {
            title,
            subtitle,
            bookType,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            isbn,
            interests,
            price,
            status,
            active,
            authorId
        } = req.body;

        if (!title || !authorId || !price) {
            return res.status(400).json({ message: "Título, autor y precio son obligatorios." });
        }

        // Verificar que la edición exista
        const edition = await Edition.findByPk(editionId);
        if (!edition) {
            return res.status(404).json({ message: "Edición no encontrada." });
        }

        // Crear libro con editionId y demás campos
        const newBook = await Book.create({
            editionId,
            title,
            subtitle: subtitle || null,
            bookType: bookType || "libro edición", // valor por defecto
            cover: cover || null,
            openDate: openDate || null,
            deadlineChapters: deadlineChapters || null,
            publishDate: publishDate || null,
            isbn: isbn || null,
            interests: interests || null,
            price,
            status: status || "desarrollo",
            active: active !== undefined ? active : true,
            authorId,
        });

        res.status(201).json({ message: "Libro creado en la edición.", book: newBook });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Listar libros de una edición
exports.getBooksForEdition = async (req, res) => {
    try {
        const { id: editionId } = req.params;
        const edition = await Edition.findByPk(editionId);
        if (!edition) return res.status(404).json({ message: "Edición no encontrada." });

        const books = await Book.findAll({ where: { editionId } });
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un libro concreto de la edición
exports.getOneBookFromEdition = async (req, res) => {
    try {
        const { id: editionId, bookId } = req.params;
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado en esta edición." });

        res.status(200).json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un libro
exports.updateBookFromEdition = async (req, res) => {
    try {
        const { id: editionId, bookId } = req.params;
        // Se actualizan los campos correspondientes; no olvides que estos pueden incluir los nuevos
        const {
            title,
            subtitle,
            bookType,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            isbn,
            interests,
            price,
            status,
            active
        } = req.body;

        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado en esta edición." });

        await book.update({
            title,
            subtitle,
            bookType,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            isbn,
            interests,
            price,
            status,
            active
        });
        res.status(200).json({ message: "Libro actualizado.", book });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un libro
exports.deleteBookFromEdition = async (req, res) => {
    try {
        const { id: editionId, bookId } = req.params;
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado en esta edición." });

        await book.destroy();
        res.status(200).json({ message: "Libro eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ========================
// Capítulos anidados
// ========================

// Crear un capítulo dentro de un libro de una edición
exports.createChapterForBook = async (req, res) => {
    try {
        const { id: editionId, bookId } = req.params;
        // Se esperan los campos nuevos, incluyendo 'methodology'
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
            !authorId
        ) {
            return res.status(400).json({ message: "Faltan campos obligatorios para el capítulo." });
        }

        // Verificar que el libro existe y pertenece a la edición
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) {
            return res.status(404).json({ message: "Libro no encontrado en esta edición." });
        }

        // Crear capítulo con los campos correspondientes
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
            bookId: book.id,
        });

        res.status(201).json({ message: "Capítulo creado.", chapter: newChapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Listar capítulos de un libro
exports.getChaptersForBook = async (req, res) => {
    try {
        const { id: editionId, bookId } = req.params;
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado en esta edición." });

        const chapters = await Chapter.findAll({ where: { bookId: book.id } });
        res.status(200).json(chapters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un capítulo concreto
exports.getOneChapter = async (req, res) => {
    try {
        const { id: editionId, bookId, chapterId } = req.params;
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });

        const chapter = await Chapter.findOne({ where: { id: chapterId, bookId: book.id } });
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });

        res.status(200).json(chapter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un capítulo
exports.updateChapter = async (req, res) => {
    try {
        const { id: editionId, bookId, chapterId } = req.params;
        // Incluir 'methodology' si se desea actualizar también ese campo
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

        // Verificar que el libro exista en la edición
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });

        // Verificar que el capítulo exista y pertenezca al libro
        const chapter = await Chapter.findOne({ where: { id: chapterId, bookId: book.id } });
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });

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

// Eliminar un capítulo
exports.deleteChapter = async (req, res) => {
    try {
        const { id: editionId, bookId, chapterId } = req.params;
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });

        const chapter = await Chapter.findOne({ where: { id: chapterId, bookId: book.id } });
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });

        await chapter.destroy();
        res.status(200).json({ message: "Capítulo eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
