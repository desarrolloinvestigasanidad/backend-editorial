// controllers/bookController.js
const Book = require("../models/Book");
const Edition = require("../models/Edition");
const Chapter = require("../models/Chapter");

// Crear un libro dentro de una edición
exports.createBookForEdition = async (req, res) => {
    try {
        const { id: editionId } = req.params; // "id" es editionId
        const { title, authorId, category, price } = req.body;

        if (!title || !authorId || !price) {
            return res.status(400).json({ message: "Campos obligatorios faltantes." });
        }

        // Verificar que la edición exista
        const edition = await Edition.findByPk(editionId);
        if (!edition) {
            return res.status(404).json({ message: "Edición no encontrada." });
        }

        // Crear libro con editionId
        const newBook = await Book.create({
            editionId,
            title,
            authorId,
            category,
            price,
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
        const { title, category, price, status } = req.body;

        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado en esta edición." });

        await book.update({ title, category, price, status });
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
exports.createChapterForBook = async (req, res) => {
    try {
        const { id: editionId, bookId } = req.params;
        const { title, content, authorId } = req.body;

        if (!title || !content || !authorId) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        // Verificar que el libro existe y pertenece a la edición
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado en esta edición." });

        const newChapter = await Chapter.create({
            title,
            content,
            authorId,
            bookId: book.id,
        });

        res.status(201).json({ message: "Capítulo creado.", chapter: newChapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

exports.updateChapter = async (req, res) => {
    try {
        const { id: editionId, bookId, chapterId } = req.params;
        const { title, content, status } = req.body;

        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });

        const chapter = await Chapter.findOne({ where: { id: chapterId, bookId: book.id } });
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });

        await chapter.update({ title, content, status });
        res.status(200).json({ message: "Capítulo actualizado.", chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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
