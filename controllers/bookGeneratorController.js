// controllers/bookGeneratorController.js
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const ChapterAuthor = require("../models/ChapterAuthor");
const User = require("../models/User");

const { renderBookHtml } = require("../services/htmlRenderer");
const { htmlToPdfBuffer } = require("../services/pdfRenderer");
const { prependCoverPdf } = require("../services/pdfMerger");
const { paginateChapters } = require("../services/paginateChapters");
const { enhancePdf } = require("../services/pdfEnhancer");
const { addBookmarksToPdf } = require("../services/pdfBookmarks");
const { addWatermark } = require("../services/watermarkService");
const { generateCacheKey, getCachedPdf, cachePdf } = require("../services/cacheService");
const { URL } = require("url");

// ← IMPORTAMOS S3 y PUT para público
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

exports.generateBookPdf = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { forceRefresh, draft } = req.query;

        // 1️⃣ Datos de libro y capítulos
        const book = await Book.findByPk(bookId, {
            include: [{ model: User, as: 'coAuthors' }]
        });
        if (!book) return res.status(404).json({ message: "Libro no encontrado" });

        const rawChapters = await Chapter.findAll({
            where: { bookId },
            include: [{
                model: User,
                as: "authors",
                attributes: ["firstName", "lastName"],
                through: { attributes: ["order"] },
            }],
            order: [
                ["createdAt", "ASC"],
                [{ model: User, as: "authors" }, ChapterAuthor, "order", "ASC"],
            ],
        });

        if (!rawChapters.length)
            return res.status(400).json({ message: "El libro no tiene capítulos" });

        // 🚫 Ignorar caché temporalmente para ver cambios en la plantilla
        // const cacheKey = generateCacheKey(book, rawChapters);
        // const cachedPdf = await getCachedPdf(cacheKey);
        // if (cachedPdf) {
        //     console.log("Usando PDF en caché");

        //     const bucket = process.env.S3_BUCKET;
        //     const region = process.env.AWS_REGION;
        //     const s3 = new S3Client({ region });
        //     const key = `books/${bookId}/pdfs/book_${bookId}.pdf`;
        //     await s3.send(new PutObjectCommand({
        //         Bucket: bucket,
        //         Key: key,
        //         Body: cachedPdf,
        //         ContentType: "application/pdf",
        //     }));
        //     const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        //     return res.status(200).json({ url: publicUrl, cached: true });
        // }

        const index = paginateChapters(rawChapters);

        const chapters = rawChapters.map((c, i) => {
            const authorNames = c.authors && c.authors.length
                ? c.authors.map(u => `${u.firstName} ${u.lastName}`)
                : ["Autor Anónimo"];

            return {
                title: c.title || "Sin título",
                authors: authorNames,
                page: index[i].page,
                introduction: c.introduction || "",
                methodology: c.methodology || "",
                objectives: c.objectives || "",
                results: c.results || "",
                discussion: c.discussion || "",
                bibliography: c.bibliography || "",
            };
        });

        // 3️⃣ Generar PDF en buffer
        console.log("Renderizando HTML…");
        const html = await renderBookHtml({
            book,
            chapters,
            index,
            coAuthors: book.coAuthors,
            issueDate: new Date(),
        });
        console.log("Convirtiendo HTML a PDF…");
        const htmlPdf = await htmlToPdfBuffer(html);

        // 3.5️⃣ Mezclar portada si existe
        let finalBuffer = htmlPdf;
        if (book.cover) {
            console.log("Añadiendo portada…");
            finalBuffer = await prependCoverPdf(book.cover, htmlPdf);
        }

        // 4️⃣ Metadatos, marcadores, watermark si aplica
        console.log("Añadiendo metadatos…");
        finalBuffer = await enhancePdf(finalBuffer, book, chapters);
        console.log("Añadiendo marcadores…");
        finalBuffer = await addBookmarksToPdf(finalBuffer, book, chapters, index);
        if (draft === "true") {
            console.log("Añadiendo marca de agua BORRADOR…");
            finalBuffer = await addWatermark(finalBuffer, "BORRADOR");
        }

        // 5️⃣ Cachear de todos modos para el futuro
        const cacheKey = generateCacheKey(book, rawChapters);
        await cachePdf(cacheKey, finalBuffer);

        // 6️⃣ Subir a S3 y devolver URL pública
        console.log("Subiendo a S3 público…");
        const bucket = process.env.S3_BUCKET;
        const region = process.env.AWS_REGION;
        const s3 = new S3Client({ region });
        const pdfKey = `books/${bookId}/pdfs/book_${bookId}.pdf`;
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: pdfKey,
            Body: finalBuffer,
            ContentType: "application/pdf",
        }));
        const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${pdfKey}`;

        await book.update({ documentUrl: publicUrl });
        return res.status(200).json({ url: publicUrl, cached: false });

    } catch (err) {
        console.error("Error generateBookPdf:", err);
        return res.status(500).json({
            message: "Error al generar el PDF",
            details: err.message,
        });
    }
};

