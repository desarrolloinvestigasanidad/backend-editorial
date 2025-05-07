// services/pdfBookmarks.js
const { PDFDocument } = require("pdf-lib")

/**
 * Añade marcadores (bookmarks) al PDF para facilitar la navegación
 * @param {Buffer} pdfBuffer - Buffer del PDF generado
 * @param {Object} book - Datos del libro
 * @param {Array} chapters - Array de capítulos
 * @param {Array} index - Array con información de paginación
 * @returns {Promise<Buffer>} - Buffer del PDF con marcadores
 */
async function addBookmarksToPdf(pdfBuffer, book, chapters, index) {
    try {
        // Cargar el PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer)

        // Crear marcador raíz para el libro
        const bookmarkRoot = pdfDoc.addBookmark(book.title, 0)

        // Añadir marcador para el índice
        pdfDoc.addBookmark("Índice", 3, bookmarkRoot)

        // Añadir marcadores para cada capítulo
        chapters.forEach((chapter, i) => {
            // Calcular la página del capítulo (restar 1 porque pdf-lib usa índice base 0)
            const pageIndex = index[i].page - 1

            // Crear marcador para el capítulo
            const chapterBookmark = pdfDoc.addBookmark(`${i + 1}. ${chapter.title}`, pageIndex, bookmarkRoot)

            // Añadir marcadores para las secciones del capítulo si existen
            let sectionOffset = 0 // Offset aproximado para posicionar los marcadores de sección

            if (chapter.introduction) {
                pdfDoc.addBookmark("Introducción", pageIndex + sectionOffset, chapterBookmark)
                sectionOffset += 0.2 // Incremento aproximado por sección
            }

            if (chapter.objectives) {
                pdfDoc.addBookmark("Objetivos", pageIndex + sectionOffset, chapterBookmark)
                sectionOffset += 0.2
            }

            if (chapter.methodology) {
                pdfDoc.addBookmark("Metodología", pageIndex + sectionOffset, chapterBookmark)
                sectionOffset += 0.2
            }

            if (chapter.results) {
                pdfDoc.addBookmark("Resultados", pageIndex + sectionOffset, chapterBookmark)
                sectionOffset += 0.2
            }

            if (chapter.discussion) {
                pdfDoc.addBookmark("Discusión-Conclusión", pageIndex + sectionOffset, chapterBookmark)
                sectionOffset += 0.2
            }

            if (chapter.bibliography) {
                pdfDoc.addBookmark("Bibliografía", pageIndex + sectionOffset, chapterBookmark)
            }
        })

        // Guardar el PDF con marcadores
        const bookmarkedPdfBytes = await pdfDoc.save()
        return Buffer.from(bookmarkedPdfBytes)
    } catch (error) {
        console.error("Error al añadir marcadores al PDF:", error)
        // Si hay un error, devolvemos el buffer original sin modificar
        return pdfBuffer
    }
}

module.exports = { addBookmarksToPdf }
