const Book = require("../models/Book");
const Chapter = require("../models/Chapter");

exports.getMyPublications = async (req, res) => {
    try {
        const { userId } = req.params;
        const books = await Book.findAll({ where: { authorId: userId } });
        const chapters = await Chapter.findAll({ where: { authorId: userId } });
        res.status(200).json({ books, chapters });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLibrary = async (req, res) => {
    try {
        // Ejemplo: obtener todos los libros con status "published"
        const books = await Book.findAll({ where: { status: "published" } });
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
