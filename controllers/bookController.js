// controllers/bookController.js
const Book = require("../models/Book");
const Edition = require("../models/Edition");
const Chapter = require("../models/Chapter");

// ========================
// Libros en Edición
// ========================


exports.createBookForEdition = async (req, res) => {
    try {

        const {
            title,
            subtitle,
            price,
            isbn,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            interests, editionId
        } = req.body;
        // Asumimos que authorId es nulo
        const authorId = null;

        if (!title || !price) {
            return res.status(400).json({ message: "Campos obligatorios faltantes: título y precio." });
        }

        const newBook = await Book.create({
            editionId,
            title,
            subtitle: subtitle || null,
            price: Number(price),
            isbn: isbn && isbn.trim() !== "" ? isbn : null,
            cover: cover || null,
            openDate: openDate || null,
            deadlineChapters: deadlineChapters || null,
            publishDate: publishDate || null,
            interests: interests || null,
            bookType: "libro edición", // Valor por defecto
            status: "desarrollo",        // Valor por defecto
            active: true,                // Valor por defecto
            authorId,
        });

        res.status(201).json({ message: "Libro creado.", book: newBook });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        // Obtenemos editionId y bookId de los parámetros de la URL
        const { editionId, bookId } = req.params;
        // Extraemos el resto de campos del body
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
            editionId,
            bookId: book.id,  // Usamos el id del libro encontrado
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            authorId,
            content: introduction,  // O cualquier otra lógica para content
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

// Función para obtener todos los libros
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.findAll();
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Función para obtener un libro propio por su id
exports.getOneBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });
        res.status(200).json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Función para crear un libro propio
exports.createBook = async (req, res) => {
    try {
        const { title, subtitle, price, isbn, cover, openDate, deadlineChapters, publishDate, interests } = req.body;
        if (!title || !price) {
            return res.status(400).json({ message: "Campos obligatorios faltantes: título y precio." });
        }
        const newBook = await Book.create({
            editionId: null,
            title,
            subtitle: subtitle || null,
            price: Number(price),
            isbn: isbn && isbn.trim() !== "" ? isbn : null,
            cover: cover || null,
            openDate: openDate || null,
            deadlineChapters: deadlineChapters || null,
            publishDate: publishDate || null,
            interests: interests || null,
            bookType: "libro propio",
            status: "desarrollo",
            active: true,
            authorId: null,
        });
        res.status(201).json({ message: "Libro propio creado.", book: newBook });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para actualizar un libro propio
exports.updateBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { title, subtitle, bookType, cover, openDate, deadlineChapters, publishDate, isbn, interests, price, status, active } = req.body;
        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });
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
            active,
        });
        res.status(200).json({ message: "Libro actualizado.", book });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Función para eliminar un libro propio
exports.deleteBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });
        await book.destroy();
        res.status(200).json({ message: "Libro eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
