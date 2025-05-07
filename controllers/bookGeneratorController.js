// controllers/bookGeneratorController.js
const Book = require("../models/Book")
const Chapter = require("../models/Chapter")
const { uploadPDF, getPDFUrl } = require("../services/s3Service")
const { renderBookHtml } = require("../services/htmlRenderer")
const { htmlToPdfBuffer } = require("../services/pdfRenderer")
const { prependCoverPdf } = require("../services/pdfMerger")
const { paginateChapters } = require("../services/paginateChapters")
const { enhancePdf } = require("../services/pdfEnhancer")
const { addBookmarksToPdf } = require("../services/pdfBookmarks")
const { addWatermark } = require("../services/watermarkService")
const { generateCacheKey, getCachedPdf, cachePdf } = require("../services/cacheService")
const { URL } = require("url")

exports.generateBookPdf = async (req, res) => {
    try {
        const { bookId } = req.params
        const { forceRefresh, draft } = req.query

        // 1️⃣ Get book and chapters data
        const book = await Book.findByPk(bookId)
        if (!book) return res.status(404).json({ message: "Libro no encontrado" })

        const rawChapters = await Chapter.findAll({
            where: { bookId },
            order: [["createdAt", "ASC"]],
            raw: true,
        })
        if (!rawChapters.length) return res.status(400).json({ message: "El libro no tiene capítulos" })

        // 1.5️⃣ Check cache if not forcing refresh
        if (!forceRefresh) {
            const cacheKey = generateCacheKey(book, rawChapters)
            const cachedPdf = await getCachedPdf(cacheKey)
            if (cachedPdf) {
                console.log("Usando PDF en caché")
                // Upload cached PDF to S3 to get a fresh URL
                const fileName = `book_${bookId}.pdf`
                const key = await uploadPDF(cachedPdf, fileName, "application/pdf")
                const url = await getPDFUrl(key, 3600)
                return res.status(200).json({ url, cached: true })
            }
        }

        // 2️⃣ Process chapters data
        console.log("Procesando datos de capítulos...")
        rawChapters.forEach((c) => {
            c.authors = c.authorName ? [c.authorName] : c.authorId ? [c.authorId] : ["Anon."]
        })

        const index = paginateChapters(rawChapters)
        const chapters = rawChapters.map((c, i) => ({
            title: c.title || "Sin título",
            authors: c.authors || [],
            page: index[i].page,
            introduction: c.introduction || "",
            methodology: c.methodology || "",
            objectives: c.objectives || "",
            results: c.results || "",
            discussion: c.discussion || "",
            bibliography: c.bibliography || "",
        }))

        // 3️⃣ Generate PDF
        console.log("Generando PDF...")
        try {
            // Render HTML
            console.log("Renderizando HTML...")
            const html = await renderBookHtml(book, chapters, index)

            // Convert HTML to PDF
            console.log("Convirtiendo HTML a PDF...")
            const htmlPdf = await htmlToPdfBuffer(html)

            // Merge with cover if available
            let finalBuffer = htmlPdf
            if (book.cover) {
                // Parseamos la URL y miramos sólo la ruta (sin query params)
                const coverPath = new URL(book.cover).pathname
                if (coverPath.toLowerCase().endsWith(".pdf")) {
                    console.log("Añadiendo portada…")
                    finalBuffer = await prependCoverPdf(book.cover, htmlPdf)
                }
            }

            // Add metadata
            console.log("Añadiendo metadatos...")
            finalBuffer = await enhancePdf(finalBuffer, book, chapters)

            // Add bookmarks for navigation
            console.log("Añadiendo marcadores para navegación...")
            finalBuffer = await addBookmarksToPdf(finalBuffer, book, chapters, index)

            // Add watermark if draft mode
            if (draft === "true") {
                console.log("Añadiendo marca de agua BORRADOR...")
                finalBuffer = await addWatermark(finalBuffer, "BORRADOR")
            }

            // Cache the final PDF
            const cacheKey = generateCacheKey(book, rawChapters)
            await cachePdf(cacheKey, finalBuffer)

            // 4️⃣ Upload to S3 and save URL
            console.log("Subiendo a S3...")
            const fileName = `book_${bookId}.pdf`
            const key = await uploadPDF(finalBuffer, fileName, "application/pdf")
            const url = await getPDFUrl(key, 3600)
            await book.update({ documentUrl: url })

            return res.status(200).json({ url, cached: false })
        } catch (err) {
            console.error("Error generating PDF:", err)
            return res.status(500).json({
                message: "Error al generar el PDF",
                details: err.message,
            })
        }
    } catch (err) {
        console.error("Unexpected error:", err)
        return res.status(500).json({
            message: "Error inesperado",
            details: err.message,
        })
    }
}
