// controllers/bookAuthorsController.js
const Book = require("../models/Book");
const User = require("../models/User");
const BookAuthor = require("../models/BookAuthor");

exports.listBookAuthors = async (req, res) => {
    const { bookId } = req.params;
    const book = await Book.findByPk(bookId, {
        include: [{ model: User, as: "coAuthors", attributes: ["id", "dni", "fullName", "email"] }]
    });
    if (!book) return res.status(404).json({ message: "Libro no encontrado" });
    res.json(book.coAuthors);
};

exports.addBookAuthor = async (req, res) => {
    const { bookId } = req.params;
    const { userId } = req.body;
    // verificar existencia
    const [book, user] = await Promise.all([
        Book.findByPk(bookId),
        User.findByPk(userId)
    ]);
    if (!book || !user) return res.status(404).json({ message: "Libro o usuario no existe" });
    // crear relación
    await BookAuthor.findOrCreate({ where: { bookId, userId } });
    res.status(201).json({ message: "Co-autor añadido" });
};

exports.removeBookAuthor = async (req, res) => {
    const { bookId, userId } = req.params;
    await BookAuthor.destroy({ where: { bookId, userId } });
    res.json({ message: "Co-autor eliminado" });
};
