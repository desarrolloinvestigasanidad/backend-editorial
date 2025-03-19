const Book = require("../models/Book");
const Chapter = require("../models/Chapter");

// Obtener las publicaciones (libros y capítulos) del usuario
exports.getMyPublications = async (req, res) => {
    try {
        const { userId } = req.params;
        // Se obtienen todos los libros creados por el usuario
        const books = await Book.findAll({ where: { authorId: userId } });
        // Se obtienen todos los capítulos creados por el usuario
        const chapters = await Chapter.findAll({ where: { authorId: userId } });
        res.status(200).json({ books, chapters });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener la biblioteca: ejemplo de todos los libros publicados
exports.getLibrary = async (req, res) => {
    try {
        // Se filtran los libros cuyo status es "published"
        const books = await Book.findAll({ where: { status: "published" } });
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
