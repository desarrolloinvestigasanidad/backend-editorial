// routes/books.js
const express = require("express");
const {
    getAllBooks,    // Ya existe en bookController.js (retorna todos los libros)
    getOneBook,     // Función nueva: obtiene un libro por su id sin depender de una edición
    createBook,     // Función nueva: crea un libro propio (sin editionId)
    updateBook,     // Función nueva: actualiza un libro propio
    deleteBook,
    getChaptersForBook,
    createChapterForBook,
    getOneChapter,
    updateChapter,
    deleteChapter,
    generateBook,     // Función nueva: elimina un libro propio
} = require("../controllers/bookController");
const { generateBookPdf } = require("../controllers/bookGeneratorController");
const { getBooksForCoauthor, updateAuthorOrder } = require("../controllers/bookAuthorsController");
const router = express.Router();

// Listar todos los libros (podrás filtrar en el frontend por bookType === "libro propio")
router.get("/", getAllBooks);

+router.get("/coauthor", getBooksForCoauthor);
// Obtener un libro propio
router.get("/:bookId", getOneBook);

// Crear un libro propio
router.post("/", createBook);

// Actualizar un libro propio
router.put("/:bookId", updateBook);

// Eliminar un libro propio
router.delete("/:bookId", deleteBook);

router.use("/:bookId/authors", require("./bookAuthors"));
// In your routes file
router.put('/:bookId/authors/:userId/order', updateAuthorOrder);

router.post("/:bookId/generate", generateBookPdf);

router.get("/:bookId/chapters", getChaptersForBook);
router.post("/:bookId/chapters", createChapterForBook);
router.get("/:bookId/chapters/:chapterId", getOneChapter);
router.put("/:bookId/chapters/:chapterId", updateChapter);
router.delete("/:bookId/chapters/:chapterId", deleteChapter);

module.exports = router;
