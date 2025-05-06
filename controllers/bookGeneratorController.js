const path = require("path");
const fs = require("fs/promises");
const PDFDocument = require("pdfkit");
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
// Generación de PDF
// ──────────────────────────────────────────────────────────────
async function generatePDF(book, chapters, index) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 50,
                    right: 50
                },
                bufferPages: true
            });

            const buffers = [];
            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => resolve(Buffer.concat(buffers)));

            // Estilos base
            doc.font("Helvetica");

            // Portada
            doc.fontSize(24)
                .text(book.title.toUpperCase(), { align: "center" })
                .moveDown(2);

            doc.fontSize(14)
                .text(`Autor: ${book.author || "Desconocido"}`, { align: "center" })
                .moveDown(1);

            // Índice
            doc.addPage();
            doc.fontSize(18).text("ÍNDICE", { underline: true });
            index.forEach(item => {
                doc.fontSize(12)
                    .text(`${item.num}. ${item.title}`, { continued: true })
                    .text(`... ${item.page}`, { align: "right" });
                doc.moveDown();
            });

            // Contenido de capítulos
            chapters.forEach((chapter, idx) => {
                doc.addPage();
                doc.fontSize(16)
                    .text(`Capítulo ${idx + 1}: ${chapter.title.toUpperCase()}`)
                    .moveDown(0.5);

                // Contenido del capítulo
                const sections = [
                    { title: "Introducción", content: chapter.introduction },
                    { title: "Metodología", content: chapter.methodology },
                    { title: "Objetivos", content: chapter.objectives },
                    { title: "Resultados", content: chapter.results },
                    { title: "Discusión", content: chapter.discussion },
                    { title: "Bibliografía", content: chapter.bibliography }
                ];

                sections.forEach(section => {
                    if (section.content) {
                        doc.fontSize(14)
                            .text(section.title + ":", { paragraphGap: 2 })
                            .fontSize(12)
                            .text(section.content, { paragraphGap: 5 });
                        doc.moveDown();
                    }
                });
            });

            doc.end();
        } catch (err) {
            reject(err);
        }
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

        // 2️⃣ Preparar datos
        chapters.forEach(c => (c.authors = [c.authorName || c.authorId || "Anon."]));
        const index = paginateChapters(chapters);

        // 3️⃣ Generar PDF con PDFKit
        const pdfBuffer = await generatePDF(book, chapters, index);

        // 4️⃣ Subir a S3
        const fileName = `book_${bookId}.pdf`;
        const key = await uploadPDF(pdfBuffer, fileName, "application/pdf");

        // 5️⃣ Obtener URL
        const url = await getPDFUrl(key, 3600);

        await book.update({ documentUrl: url });

        return res.status(200).json({ url });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};