const Book = require("../models/Book");

exports.createBook = async (req, res) => {
    try {
        const { title, authorId, category, price } = req.body;
        if (!title || !authorId || !price) return res.status(400).json({ message: "Campos obligatorios faltantes." });
        const newBook = await Book.create({ title, authorId, category, price });
        res.status(201).json({ message: "Libro creado.", book: newBook });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBooks = async (req, res) => {
    try {
        const books = await Book.findAll();
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findByPk(id);
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });
        res.status(200).json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, price, status } = req.body;
        const book = await Book.findByPk(id);
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });
        await book.update({ title, category, price, status });
        res.status(200).json({ message: "Libro actualizado.", book });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findByPk(id);
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });
        await book.destroy();
        res.status(200).json({ message: "Libro eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
