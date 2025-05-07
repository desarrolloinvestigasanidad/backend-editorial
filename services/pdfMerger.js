// services/pdfMerger.js
const { PDFDocument } = require("pdf-lib");
const { downloadFile } = require("./s3Service");
const { URL } = require("url");

/**
 * Pre-pendea la portada (desde S3) al comienzo del PDF contenido en contentBuffer.
 *
 * @param {string} coverUrl URL completa o presigned URL de la portada en S3.
 * @param {Buffer} contentBuffer Buffer del PDF principal.
 * @returns {Promise<Buffer>} Buffer del PDF resultante con portada al inicio.
 */
async function prependCoverPdf(coverUrl, contentBuffer) {
    // 1️⃣ Extraer la ruta de la URL (quitando la "/")
    const url = new URL(coverUrl);
    // decodeURIComponent UNA vez para obtener “pÃ¡ginas-2.pdf”
    const key = decodeURIComponent(url.pathname.slice(1));
    console.log("📥  Clave (key) usada para S3:", key);

    // 2️⃣ Descargar la portada usando el SDK
    let coverBuffer;
    try {
        coverBuffer = await downloadFile(key);
    } catch (err) {
        console.error("Error descargando portada desde S3:", err);
        throw new Error("No se pudo descargar la portada PDF");
    }

    // 3️⃣ Cargar ambos documentos en PDF-Lib
    const coverDoc = await PDFDocument.load(coverBuffer);
    const contentDoc = await PDFDocument.load(contentBuffer);

    // 4️⃣ Crear nuevo PDF: páginas portada → contenido
    const mergedDoc = await PDFDocument.create();
    const coverPages = await mergedDoc.copyPages(coverDoc, coverDoc.getPageIndices());
    const contentPages = await mergedDoc.copyPages(contentDoc, contentDoc.getPageIndices());
    coverPages.forEach(p => mergedDoc.addPage(p));
    contentPages.forEach(p => mergedDoc.addPage(p));

    // 5️⃣ Serializar y devolver Buffer
    const mergedBytes = await mergedDoc.save();
    return Buffer.from(mergedBytes);
}

module.exports = { prependCoverPdf };
