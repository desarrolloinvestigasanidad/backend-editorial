const express = require("express");
const { generateChapterPDF, generateBookPDF } = require("../controllers/pdfController");
const router = express.Router();

router.get("/chapter/:chapterId", generateChapterPDF);
router.get("/book/:bookId", generateBookPDF);

module.exports = router;
