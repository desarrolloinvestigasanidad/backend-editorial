const path = require("path");
const fs = require("fs/promises");
const hbs = require("handlebars");
const puppeteer = require("puppeteer");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const { uploadPDF, getPDFUrl } = require("../services/s3Service");

// ──────────────────────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────────────────────
function textLen(str) {
    return str ? String(str).length : 0;
}
function paginateChapters(chapters, firstPage = 3) {
    let current = firstPage;
    return chapters.map((c, idx) => {
        const chars = [
            c.introduction,
            c.methodology,
            c.objectives,
            c.results,
            c.discussion,
            c.bibliography
        ].reduce((sum, part) => sum + textLen(part), 0);
        const pagesUsed = Math.max(1, Math.ceil(chars / 2800));
        const item = {
            num: idx + 1,
            title: (c.title || "Sin título").toUpperCase(),
            authors: c.authors?.join(", ") || "Autor desconocido",
            page: current
        };
        current += pagesUsed;
        return item;
    });
}

// ──────────────────────────────────────────────────────────────
//  POST /books/:bookId/generate
// ──────────────────────────────────────────────────────────────
exports.generateBookPdf = async (req, res) => {
    try {
        const { bookId } = req.params;

        // 1️⃣ Recuperar libro y capítulos
        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: "Libro no encontrado" });

        const chapters = await Chapter.findAll({
            where: { bookId },
            order: [["createdAt", "ASC"]],
            raw: true
        });
        if (!chapters.length) {
            return res.status(400).json({ message: "El libro no tiene capítulos" });
        }
        // Simula lista de autores (ajusta según tu modelo real)
        chapters.forEach(c => (c.authors = [c.authorName || c.authorId || "Anon."]));

        // 2️⃣ Prepara datos para la plantilla Handlebars
        const index = paginateChapters(chapters);
        const templateFn = hbs.compile(
            await fs.readFile(path.join(__dirname, "..", "templates", "book.hbs"), "utf8")
        );
        const html = templateFn({ book, chapters, index });

        // 3️⃣ Lanza Puppeteer y genera PDF en buffer
        const browser = await puppeteer.launch({
            args: ["--font-render-hinting=none", "--no-sandbox"]
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: 40, bottom: 40, left: 50, right: 50 },
            displayHeaderFooter: false
        });
        await browser.close();

        // 4️⃣ Sube el PDF a S3 (stream o buffer)
        const fileName = `book_${bookId}.pdf`;
        const key = await uploadPDF(pdfBuffer, fileName, "application/pdf");

        // 5️⃣ Obtén URL pública o presigned según permisos
        // Para público:
        // const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        // Para privado con presigned URL:
        const url = await getPDFUrl(key, 3600);

        return res.status(200).json({ url });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};
