const ejs = require("ejs");
const fs = require("fs/promises");
const path = require("path");
const { htmlToPdfBuffer } = require("./pdfRenderer");
const { uploadPDF, getPDFUrl } = require("./s3Service");
const { formatDate } = require("./htmlRenderer");          // reutilizar formateo de fecha

async function renderCertificateHtml({ user, book, chapter, issueDate, validationUrl }) {
    const tplPath = path.join(__dirname, "../templates/certificate.ejs");
    const tpl = await fs.readFile(tplPath, "utf-8");
    return ejs.render(tpl, {
        user,
        book,
        chapter,
        issueDate,
        validationUrl,
        formatDate,
    });
}

async function generateCertificatePdf(data) {
    // 1️⃣ Renderizar HTML
    const html = await renderCertificateHtml(data);

    // 2️⃣ Convertir a PDF
    const pdfBuffer = await htmlToPdfBuffer(html);

    // 3️⃣ Subir a S3 y obtener URL
    const fileName = `certificate_${data.user.id}_${data.chapter.id}.pdf`;
    const key = await uploadPDF(pdfBuffer, fileName, "application/pdf");
    const url = await getPDFUrl(key, 60 * 60 * 24 * 7); // firmado 7 días

    return { pdfBuffer, url };
}

module.exports = { generateCertificatePdf };
