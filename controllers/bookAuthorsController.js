// controllers/bookAuthorsController.js
const Book = require("../models/Book");
const User = require("../models/User");
const BookAuthor = require("../models/BookAuthor");

exports.listBookAuthors = async (req, res) => {
    try {
        const { bookId } = req.params;
        const book = await Book.findByPk(bookId, {
            include: [{
                model: User,
                as: "coAuthors",
                through: { attributes: [] },
                attributes: [

                    "id",
                    "firstName",
                    "lastName",
                    "email"
                ]
            }]
        });
        if (!book) return res.status(404).json({ message: "Libro no encontrado" });

        // Mapear a la forma que espera el frontend
        const coAuthors = book.coAuthors.map(u => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
        }));

        res.json(coAuthors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
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
// GET /api/books/coauthor?userId=xxx
exports.getBooksForCoauthor = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ message: "Falta userId" });

        // Comprueba que el usuario existe
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // Busca todos los libros donde esté como coautor
        const books = await Book.findAll({
            include: [{
                model: User,
                as: "coAuthors",
                where: { id: userId },
                attributes: [],    // no necesitamos datos de usuario
                through: { attributes: [] }
            }]
        });

        res.status(200).json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};