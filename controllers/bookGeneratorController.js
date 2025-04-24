const path = require("path");
const fs = require("fs/promises");
const hbs = require("handlebars");
const puppeteer = require("puppeteer");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");

// ──────────────────────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────────────────────
function textLen(str) {
    return str ? String(str).length : 0;
}
function paginateChapters(chapters, firstPage = 3) {
    let current = firstPage;
    return chapters.map((c, idx) => {
        // Usa la suma de los bloques para estimar páginas
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

        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: "Libro no encontrado" });

        const chapters = await Chapter.findAll({
            where: { bookId },
            order: [["createdAt", "ASC"]],
            raw: true
        });

        // Simula lista de autores en cada capítulo (ajusta según tu modelo)
        chapters.forEach(c => (c.authors = [c.authorName || c.authorId || "Anon."]));

        // 1- Prepara datos para la plantilla
        const index = paginateChapters(chapters);
        const templateFn = hbs.compile(
            await fs.readFile(path.join(__dirname, "..", "templates", "book.hbs"), "utf8")
        );
        const html = templateFn({ book, chapters, index });

        // 2- Lanza Puppeteer ► PDF
        const browser = await puppeteer.launch({
            args: ["--font-render-hinting=none", "--no-sandbox"]
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        // Estilos de impresión (márgenes, cabeceras…)
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: 40, bottom: 40, left: 50, right: 50 },
            displayHeaderFooter: false
        });

        await browser.close();

        // 3- Guarda el fichero y responde la URL pública
        const outDir = path.join(__dirname, "..", "public", "generated");
        const filename = `book_${bookId}.pdf`;
        await fs.mkdir(outDir, { recursive: true });
        await fs.writeFile(path.join(outDir, filename), pdfBuffer);

        res.status(200).json({ url: `/generated/${filename}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
