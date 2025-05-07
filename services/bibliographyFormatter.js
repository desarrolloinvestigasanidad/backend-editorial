// services/bibliographyFormatter.js

/**
 * Formatea la bibliografía en formato numérico académico
 * @param {string} rawBibliography - Texto de bibliografía sin formato
 * @returns {string} - Bibliografía formateada con numeración
 */
function formatNumberedBibliography(rawBibliography) {
    if (!rawBibliography) return ""

    // Dividir por saltos de línea o puntos seguidos de espacio
    const entries = rawBibliography.split(/\n|(?<=\.)\s+/).filter((entry) => entry.trim().length > 0)

    // Formatear cada entrada con número
    const formattedEntries = entries.map((entry, index) => {
        return `${index + 1}. ${entry.trim()}`
    })

    // Unir con saltos de línea y añadir estilo de indentación
    return formattedEntries.join("\n")
}

/**
 * Procesa referencias en el texto para vincularlas con la bibliografía numerada
 * @param {string} text - Texto con referencias
 * @param {number} totalRefs - Número total de referencias
 * @returns {string} - Texto con referencias formateadas
 */
function processTextReferences(text, totalRefs) {
    if (!text) return ""

    // Reemplazar patrones como [1] o (1) con formato superíndice
    let processedText = text

    // Buscar referencias numéricas entre corchetes o paréntesis
    for (let i = 1; i <= totalRefs; i++) {
        const bracketPattern = new RegExp(`\\[${i}\\]`, "g")
        const parenthesisPattern = new RegExp(`\$$${i}\$$`, "g")

        // Reemplazar con formato superíndice
        processedText = processedText
            .replace(bracketPattern, `<sup>${i}</sup>`)
            .replace(parenthesisPattern, `<sup>${i}</sup>`)
    }

    return processedText
}

module.exports = {
    formatNumberedBibliography,
    processTextReferences,
}
