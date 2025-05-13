const ejs = require("ejs");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { htmlToPdfBuffer } = require("./pdfRenderer");
const { uploadPDF, getPDFUrl } = require("./s3Service");
const { formatDate } = require("./htmlRenderer");

function buildVerifyUrl(hash) {
    const frontend = process.env.FRONTEND_URL.replace(/\/+$/, "");
    return `${frontend}/verify?hash=${hash}`;
}

async function loadLogoAsBase64(filename) {
    const filePath = path.join(__dirname, "../public/logos", filename);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, { encoding: "base64" });
    }
    return null;
}

async function renderHtml(templateName, data) {
    const tplPath = path.join(__dirname, "../templates", templateName);
    const tpl = await fsp.readFile(tplPath, "utf-8");
    return ejs.render(tpl, data);
}

/**
 * Genera el PDF para un certificado de capítulo
 */
async function generateChapterCertificate({ user, book, chapter, issueDate, verifyHash }) {
    const logoData = await loadLogoAsBase64("is.png");
    const socidesaLogoData = await loadLogoAsBase64("logo_socidesa.png");
    const signatureData = await loadLogoAsBase64("firma.png");
    const verifyUrl = buildVerifyUrl(verifyHash);

    const html = await renderHtml("certificate.ejs", {
        user,
        book,
        chapter,
        issueDate,
        logoData,
        socidesaLogoData,
        signatureData,
        verifyUrl,
        formatDate
    });

    const pdfBuffer = await htmlToPdfBuffer(html);
    const key = await uploadPDF(pdfBuffer, `cert-chapter-${verifyHash}.pdf`, "application/pdf");
    const url = await getPDFUrl(key, 60 * 60 * 24 * 7);
    return { pdfBuffer, url };
}

/**
 * Genera el PDF para un certificado de libro
 */
async function generateBookCertificate({ user, book, coAuthors, issueDate, verifyHash }) {
    const logoData = await loadLogoAsBase64("is.png");
    const socidesaLogoData = await loadLogoAsBase64("logo_socidesa.png");
    const signatureData = await loadLogoAsBase64("firma.png");
    const verifyUrl = buildVerifyUrl(verifyHash);

    const html = await renderHtml("certificate-book.ejs", {
        user,
        book,
        coAuthors,
        issueDate,
        logoData,
        socidesaLogoData,
        signatureData,
        verifyUrl,
        formatDate
    });

    const pdfBuffer = await htmlToPdfBuffer(html);
    const key = await uploadPDF(pdfBuffer, `cert-book-${verifyHash}.pdf`, "application/pdf");
    const url = await getPDFUrl(key, 60 * 60 * 24 * 7);
    return { pdfBuffer, url };
}

/**
 * Función pública que decide qué tipo de certificado generar
 */
exports.generateCertificatePdf = async function ({ type, user, book, chapter, coAuthors, issueDate, verifyHash }) {
    if (type === "book_author") {
        return await generateBookCertificate({ type, user, book, chapter, coAuthors, issueDate, verifyHash });
    } else {
        return await generateChapterCertificate({ user, book, chapter, issueDate, verifyHash });
    }
};
