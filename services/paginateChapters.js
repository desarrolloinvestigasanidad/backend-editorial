// services/paginateChapters.js
function textLen(str) {
    return str ? String(str).length : 0
}

/**
 * Calcula la paginación de los capítulos basándose en la longitud del contenido
 * @param {Array} chapters - Array de capítulos
 * @param {Number} firstPage - Número de página inicial (después de índice, etc.)
 * @returns {Array} - Array con información de paginación
 */
function paginateChapters(chapters, firstPage = 5) {
    let current = firstPage
    return chapters.map((c, idx) => {
        // Calcular longitud total del contenido del capítulo
        const chars = [c.introduction, c.methodology, c.objectives, c.results, c.discussion, c.bibliography].reduce(
            (sum, part) => sum + textLen(part),
            0,
        )

        // Estimar páginas basado en caracteres (aproximadamente 2800 por página)
        // Ajustado para el formato del libro de referencia
        const pagesUsed = Math.max(2, Math.ceil(chars / 2500))

        const item = {
            num: idx + 1,
            title: c.title,
            page: current,
        }

        current += pagesUsed
        return item
    })
}

module.exports = { paginateChapters }
