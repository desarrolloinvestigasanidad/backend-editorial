// services/certificateService.js  (Certificado de Capítulo)
const ejs = require("ejs");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { htmlToPdfBuffer } = require("./pdfRenderer");
const { uploadPDF, getPDFUrl } = require("./s3Service");
const { formatDate } = require("./htmlRenderer");

function buildVerifyUrl(hash) {
    const frontend = process.env.FRONTEND_URL.replace(/\/+$/, '');
    return `${frontend}/verify`;
}

async function renderChapterHtml({ user, book, chapter, issueDate, logoData, socidesaLogoData, signatureData, verifyUrl }) {
    const tplPath = path.join(__dirname, "../templates/certificate.ejs");
    const tpl = await fsp.readFile(tplPath, "utf-8");
    return ejs.render(tpl, {
        user, book, chapter, issueDate,
        logoData,
        socidesaLogoData,
        signatureData,
        verifyUrl,
        formatDate
    })
}

exports.generateCertificatePdf = async function ({ user, book, chapter, issueDate, verifyHash }) {
    // Leer logo
    const logoPath = path.join(__dirname, "../public/logos/is.png");
    const logoData = fs.existsSync(logoPath)
        ? fs.readFileSync(logoPath).toString("base64")
        : null;
    const socidesaPath = path.join(__dirname, "../public/logos/logo_socidesa.png");
    const socidesaLogoData = fs.readFileSync(socidesaPath, { encoding: "base64" });
    const signaturePath = path.join(__dirname, "../public/logos/firma.png");
    const signatureData = fs.existsSync(signaturePath)
        ? fs.readFileSync(signaturePath, "base64")
        : null;
    // Construir verifyUrl
    const verifyUrl = buildVerifyUrl(verifyHash);

    // Renderizar HTML
    const html = await renderChapterHtml({
        user, book, chapter, issueDate,
        logoData,
        socidesaLogoData,
        signatureData,
        verifyUrl
    });

    // Generar PDF buffer
    const pdfBuffer = await htmlToPdfBuffer(html);

    // Subir a S3
    const key = await uploadPDF(pdfBuffer, `cert-chapter-${verifyHash}.pdf`, "application/pdf");
    const url = await getPDFUrl(key, 60 * 60 * 24 * 7);

    return { pdfBuffer, url };
};