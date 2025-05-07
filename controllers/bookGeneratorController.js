// controllers/bookGeneratorController.js
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const { uploadPDF, getPDFUrl } = require("../services/s3Service");
const { renderBookHtml } = require("../services/htmlRenderer");
const { htmlToPdfBuffer } = require("../services/pdfRenderer");

exports.generateBookPdf = async (req, res) => {
    try {
        const { bookId } = req.params;
        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: "Libro no encontrado" });

        const chapters = await Chapter.findAll({
            where: { bookId },
            order: [["createdAt", "ASC"]],
            raw: true,
        });
        if (!chapters.length)
            return res.status(400).json({ message: "El libro no tiene capítulos" });

        // 1️⃣ Monta el HTML con EJS (o tu engine)
        const html = await renderBookHtml(book, chapters);

        // 2️⃣ Genera el PDF con Puppeteer
        const pdfBuffer = await htmlToPdfBuffer(html);

        // 3️⃣ Súbelo a S3 y guarda la URL
        const fileName = `book_${bookId}.pdf`;
        const key = await uploadPDF(pdfBuffer, fileName, "application/pdf");
        const url = await getPDFUrl(key, 3600);
        await book.update({ documentUrl: url });

        res.status(200).json({ url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
