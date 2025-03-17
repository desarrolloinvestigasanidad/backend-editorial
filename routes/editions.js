// routes/editions.js
const express = require("express");
const {
    createEdition,
    getEditions,
    getEdition,
    updateEdition,
    deleteEdition,
} = require("../controllers/editionController");

const {
    createBookForEdition,
    getBooksForEdition,
    getOneBookFromEdition,
    updateBookFromEdition,
    deleteBookFromEdition,
    createChapterForBook,
    getChaptersForBook,
    getOneChapter,
    updateChapter,
    deleteChapter,
} = require("../controllers/bookController");

const router = express.Router();

// CRUD Ediciones
router.post("/", createEdition);
router.get("/", getEditions);
router.get("/:id", getEdition);
router.put("/:id", updateEdition);
router.delete("/:id", deleteEdition);

// Libros dentro de una edición
router.post("/:id/books", createBookForEdition);
router.get("/:id/books", getBooksForEdition);
router.get("/:id/books/:bookId", getOneBookFromEdition);
router.put("/:id/books/:bookId", updateBookFromEdition);
router.delete("/:id/books/:bookId", deleteBookFromEdition);

// Capítulos dentro de un libro de una edición
router.post("/:id/books/:bookId/chapters", createChapterForBook);
router.get("/:id/books/:bookId/chapters", getChaptersForBook);
router.get("/:id/books/:bookId/chapters/:chapterId", getOneChapter);
router.put("/:id/books/:bookId/chapters/:chapterId", updateChapter);
router.delete("/:id/books/:bookId/chapters/:chapterId", deleteChapter);

module.exports = router;
