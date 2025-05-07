// services/htmlRenderer.js
// Genera el HTML para el libro usando EJS y un template
const ejs = require("ejs");
const fs = require("fs/promises");
const path = require("path");

async function renderBookHtml(book, chapters) {
    // Lee el template EJS
    const templatePath = path.join(__dirname, "../templates/book.ejs");
    const template = await fs.readFile(templatePath, "utf-8");
    // Renderiza HTML con los datos de libro y capítulos
    return ejs.render(template, { book, chapters });
}

module.exports = { renderBookHtml };