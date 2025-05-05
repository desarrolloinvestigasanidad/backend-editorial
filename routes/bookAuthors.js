// routes/bookAuthors.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    listBookAuthors,
    addBookAuthor,
    removeBookAuthor,
    getBooksForCoauthor
} = require("../controllers/bookAuthorsController");

router.get("/coauthor", getBooksForCoauthor);
// /api/books/:bookId/authors
router.get("/", listBookAuthors);
router.post("/", addBookAuthor);

router.delete("/:userId", removeBookAuthor);


module.exports = router;
