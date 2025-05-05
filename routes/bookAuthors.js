// routes/bookAuthors.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    listBookAuthors,
    addBookAuthor,
    removeBookAuthor
} = require("../controllers/bookAuthorsController");

// /api/books/:bookId/authors
router.get("/", listBookAuthors);
router.post("/", addBookAuthor);
router.delete("/:userId", removeBookAuthor);

module.exports = router;
