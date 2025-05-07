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
    // 1️⃣ Extraer la key de S3 de la URL
    const url = new URL(coverUrl);
    const key = decodeURIComponent(url.pathname.slice(1)); // quita la "/" inicial

    // 2️⃣ Descargar la portada desde S3 usando el SDK
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

    // 4️⃣ Crear nuevo documento y copiar páginas en orden: portada → contenido
    const mergedDoc = await PDFDocument.create();

    const coverPages = await mergedDoc.copyPages(coverDoc, coverDoc.getPageIndices());
    coverPages.forEach((p) => mergedDoc.addPage(p));

    const contentPages = await mergedDoc.copyPages(contentDoc, contentDoc.getPageIndices());
    contentPages.forEach((p) => mergedDoc.addPage(p));

    // 5️⃣ Serializar y devolver Buffer
    const mergedBytes = await mergedDoc.save();
    return Buffer.from(mergedBytes);
}

module.exports = { prependCoverPdf };
