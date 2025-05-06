// controllers/bookAuthorsController.js
const { Op } = require('sequelize');
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

// controllers/bookAuthorsController.js - método updateAuthorOrder

exports.updateAuthorOrder = async (req, res) => {
    try {
        const { bookId, userId } = req.params;
        const { order } = req.body;

        if (order === undefined) {
            return res.status(400).json({ message: "Se requiere el campo 'order'" });
        }

        // Verificar que la relación autor-libro existe
        const bookAuthor = await BookAuthor.findOne({
            where: {
                bookId,
                userId
            }
        });

        if (!bookAuthor) {
            return res.status(404).json({ message: "Relación autor-libro no encontrada" });
        }

        // Verificar que el libro existe y no está en revisión
        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({ message: "Libro no encontrado" });
        }

        if (book.status === "Revisión" || book.status === "Publicado") {
            return res.status(403).json({
                message: "No se puede modificar el orden de autores en un libro que está en revisión o publicado"
            });
        }

        // Verificar que el usuario no es el autor principal
        if (book.userId === parseInt(userId)) {
            return res.status(403).json({
                message: "No se puede modificar el orden del autor principal"
            });
        }

        // Si hay otro autor con el mismo orden, intercambiar posiciones
        const authorWithSameOrder = await BookAuthor.findOne({
            where: {
                bookId,
                order,
                userId: { [Op.ne]: userId } // No es el mismo autor
            }
        });

        if (authorWithSameOrder) {
            // Guardar el orden actual del autor que estamos modificando
            const currentOrder = bookAuthor.order;

            // Actualizar el otro autor con el orden actual
            await authorWithSameOrder.update({ order: currentOrder });
        }

        // Actualizar el orden del autor solicitado
        await bookAuthor.update({ order });

        res.json({
            message: "Orden de autor actualizado correctamente",
            author: {
                userId,
                bookId,
                order
            }
        });
    } catch (err) {
        console.error("Error al actualizar orden de autor:", err);
        res.status(500).json({ error: err.message });
    }
};