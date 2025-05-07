// services/htmlRenderer.js
const ejs = require("ejs")
const fs = require("fs/promises")
const path = require("path")
const { formatNumberedBibliography, processTextReferences } = require("./bibliographyFormatter")

/**
 * Formatea una fecha ISO a formato local español
 */
function formatDate(iso) {
    if (!iso) return ""
    const d = new Date(iso)
    return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

/**
 * Renderiza el HTML del libro usando la plantilla EJS
 */
async function renderBookHtml(book, chapters, index) {
    try {
        // Procesar bibliografía para cada capítulo
        chapters.forEach((chapter) => {
            if (chapter.bibliography) {
                // Formatear bibliografía con numeración
                chapter.formattedBibliography = formatNumberedBibliography(chapter.bibliography)

                // Contar número de referencias
                const refCount = chapter.formattedBibliography.split("\n").length

                // Procesar referencias en el texto
                if (chapter.introduction) {
                    chapter.introduction = processTextReferences(chapter.introduction, refCount)
                }
                if (chapter.methodology) {
                    chapter.methodology = processTextReferences(chapter.methodology, refCount)
                }
                if (chapter.results) {
                    chapter.results = processTextReferences(chapter.results, refCount)
                }
                if (chapter.discussion) {
                    chapter.discussion = processTextReferences(chapter.discussion, refCount)
                }
            }
        })

        // Usar la plantilla mejorada
        const tplPath = path.join(__dirname, "../templates/book.ejs")
        const tpl = await fs.readFile(tplPath, "utf-8")

        // Renderizar con opciones de seguridad
        return ejs.render(
            tpl,
            {
                book,
                chapters,
                index,
                formatDate,
                currentYear: new Date().getFullYear(),
            },
            {
                rmWhitespace: false,
            },
        )
    } catch (error) {
        console.error("Error al renderizar HTML:", error)
        throw error
    }
}

module.exports = { renderBookHtml, formatDate }
