// services/htmlRenderer.js

const ejs = require("ejs");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const {
    formatNumberedBibliography,
    processTextReferences,
} = require("./bibliographyFormatter");

/**
 * Carga un archivo de logo desde /public/logos como Base64
 */
async function loadLogoAsBase64(filename) {
    const filePath = path.join(__dirname, "../public/logos", filename);
    try {
        if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            return buffer.toString("base64");
        }
    } catch (err) {
        console.warn(`No se pudo cargar el logo "${filename}":`, err);
    }
    return null;
}

/**
 * Formatea una fecha ISO a formato local español
 */
function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

/**
 * Renderiza el HTML del libro usando la plantilla EJS
 */
async function renderBookHtml({
    book,
    chapters = [],
    index = [],
    coAuthors = [],
    issueDate,
}) {
    try {
        // 1) Procesar bibliografía y referencias en cada capítulo
        chapters.forEach((chapter) => {
            if (chapter.bibliography) {
                // Formatear bibliografía con numeración
                chapter.formattedBibliography = formatNumberedBibliography(
                    chapter.bibliography
                );

                // Contar número de referencias
                const refCount = chapter.formattedBibliography.split("\n").length;

                // Procesar referencias en el texto de secciones
                ["introduction", "methodology", "results", "discussion"].forEach(
                    (field) => {
                        if (chapter[field]) {
                            chapter[field] = processTextReferences(
                                chapter[field],
                                refCount
                            );
                        }
                    }
                );
            }
        });

        // 2) Cargar logos como Base64
        const logoData = await loadLogoAsBase64("is.png");
        const socidesaLogoData = await loadLogoAsBase64("logo_socidesa.png");

        // 3) Leer la plantilla EJS
        const tplPath = path.join(__dirname, "../templates/book.ejs");
        const tpl = await fsp.readFile(tplPath, "utf-8");

        // 4) Renderizar la plantilla con todo el contexto necesario
        return ejs.render(
            tpl,
            {
                book,
                chapters,
                index,
                coAuthors,
                issueDate,
                formatDate,
                currentYear: new Date().getFullYear(),
                logoData,
                socidesaLogoData,
            },
            {
                rmWhitespace: false,
            }
        );
    } catch (error) {
        console.error("Error al renderizar HTML:", error);
        throw error;
    }
}

module.exports = {
    renderBookHtml,
    formatDate,
};
