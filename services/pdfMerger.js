// services/pdfMerger.js
const { PDFDocument } = require("pdf-lib");
// en Node 18+ fetch es global

/**
 * Pre-pendea coverPdf (descargado de coverUrl) al comienzo de contentBuffer.
 */
async function prependCoverPdf(coverUrl, contentBuffer) {
    // 1️⃣ Descarga el PDF de portada
    const res = await fetch(coverUrl);
    if (!res.ok) throw new Error("No se pudo descargar la portada PDF");
    const coverBytes = await res.arrayBuffer();

    // 2️⃣ Carga ambos documentos
    const coverDoc = await PDFDocument.load(coverBytes);
    const contentDoc = await PDFDocument.load(contentBuffer);

    // 3️⃣ Crea nuevo PDF y copia páginas
    const mergedDoc = await PDFDocument.create();
    const coverPages = await mergedDoc.copyPages(
        coverDoc, coverDoc.getPageIndices()
    );
    coverPages.forEach(p => mergedDoc.addPage(p));

    const contentPages = await mergedDoc.copyPages(
        contentDoc, contentDoc.getPageIndices()
    );
    contentPages.forEach(p => mergedDoc.addPage(p));

    // 4️⃣ Serializa
    const mergedBytes = await mergedDoc.save();
    return Buffer.from(mergedBytes);
}

module.exports = { prependCoverPdf };
