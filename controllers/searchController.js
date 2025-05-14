// controllers/searchController.js

const { Op } = require("sequelize");
const Edition = require("../models/Edition");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");

exports.search = async (req, res) => {
    try {
        const q = (req.query.query || "").trim();
        if (q.length < 3) {
            return res.status(400).json({ message: "Debe enviar al menos 3 caracteres." });
        }
        const cond = { [Op.like]: `%${q}%` };

        // 1) Ediciones
        const editions = await Edition.findAll({
            where: { title: cond },
            attributes: ["id", "title", "subtitle"],
            limit: 5,
        });

        // 2) Libros (propios o de edición)
        const books = await Book.findAll({
            where: { title: cond },
            attributes: ["id", "title", "subtitle", "editionId"],
            limit: 5,
        });

        // 3) Capítulos (propios o de edición)
        const chapters = await Chapter.findAll({
            where: { title: cond },
            attributes: ["id", "title", "bookId", "editionId"],
            limit: 5,
        });

        // 4) Unificar
        const suggestions = [
            ...editions.map((e) => ({
                id: e.id,
                type: "edition",
                title: e.title,
                subtitle: e.subtitle,
            })),
            ...books.map((b) => ({
                id: b.id,
                type: "book",
                title: b.title,
                subtitle: b.subtitle,
                editionId: b.editionId,    // ✎ contexto
            })),
            ...chapters.map((c) => ({
                id: c.id,
                type: "chapter",
                title: c.title,
                bookId: c.bookId,          // ✎ contexto
                editionId: c.editionId,    // ✎ contexto (puede ser null para capítulos propios)
            })),
        ];

        return res.json(suggestions);
    } catch (err) {
        console.error("Error en /api/search:", err.stack);
        return res.status(500).json({ message: err.message });
    }
};
