// routes/books.js
const express = require("express");
const {
    getAllBooks,    // Ya existe en bookController.js (retorna todos los libros)
    getOneBook,     // Función nueva: obtiene un libro por su id sin depender de una edición
    createBook,     // Función nueva: crea un libro propio (sin editionId)
    updateBook,     // Función nueva: actualiza un libro propio
    deleteBook,     // Función nueva: elimina un libro propio
} = require("../controllers/bookController");

const router = express.Router();

// Listar todos los libros (podrás filtrar en el frontend por bookType === "libro propio")
router.get("/", getAllBooks);

// Obtener un libro propio
router.get("/:bookId", getOneBook);

// Crear un libro propio
router.post("/", createBook);

// Actualizar un libro propio
router.put("/:bookId", updateBook);

// Eliminar un libro propio
router.delete("/:bookId", deleteBook);

module.exports = router;
