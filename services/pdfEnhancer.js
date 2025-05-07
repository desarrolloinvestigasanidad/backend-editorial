// services/pdfEnhancer.js
const { PDFDocument } = require("pdf-lib")

/**
 * Añade metadatos al PDF para mejorar su indexación y accesibilidad
 */
async function enhancePdf(pdfBuffer, book, chapters) {
    try {
        // Cargar el PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer)

        // Establecer metadatos
        pdfDoc.setTitle(book.title)
        pdfDoc.setAuthor("Investiga Sanidad")
        pdfDoc.setSubject("Publicación Científica")

        // Crear palabras clave basadas en títulos de capítulos
        const keywords = chapters.map((c) => c.title).join(", ")
        pdfDoc.setKeywords([book.title, "investigación", "sanidad", "científico", keywords])

        pdfDoc.setCreator("Investiga Sanidad PDF Generator")
        pdfDoc.setProducer("Investiga Sanidad")

        // Guardar el PDF
        const enhancedPdfBytes = await pdfDoc.save()
        return Buffer.from(enhancedPdfBytes)
    } catch (error) {
        console.error("Error al mejorar el PDF:", error)
        // Si hay un error, devolvemos el buffer original sin modificar
        return pdfBuffer
    }
}

module.exports = { enhancePdf }
