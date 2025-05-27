// services/pdfMerger.js
const { PDFDocument, PageSizes } = require("pdf-lib"); // PageSizes para definir el tamaño de la página de la portada si es necesario
const { downloadFile } = require("./s3Service");
const { URL } = require("url");

/**
 * Pre-pendea la portada (desde S3, puede ser PDF o imagen) al comienzo del PDF contenido en contentBuffer.
 *
 * @param {string} coverUrl URL completa o presigned URL de la portada en S3.
 * @param {Buffer} contentBuffer Buffer del PDF principal.
 * @returns {Promise<Buffer>} Buffer del PDF resultante con portada al inicio, o el contentBuffer original si hay error con la portada.
 */
async function prependCoverPdf(coverUrl, contentBuffer) {
    let coverKey;
    try {
        const url = new URL(coverUrl);
        coverKey = decodeURIComponent(url.pathname.slice(1));
        console.log("📥  Clave (key) de portada usada para S3:", coverKey);
    } catch (err) {
        console.error("URL de portada inválida:", coverUrl, err);
        return contentBuffer; // Devolver contenido original si la URL no es válida
    }

    let coverBuffer;
    try {
        coverBuffer = await downloadFile(coverKey);
    } catch (err) {
        console.error(`Error descargando portada '${coverKey}' desde S3:`, err);
        // Si no se puede descargar, podrías optar por devolver el PDF sin portada
        // o lanzar un error si la portada es obligatoria.
        // Por ahora, devolvemos el contenido original para no romper la generación completa.
        return contentBuffer;
    }

    let coverDoc;
    const fileExtension = coverKey.split('.').pop().toLowerCase();

    try {
        if (['png', 'jpg', 'jpeg'].includes(fileExtension)) {
            console.log(`Procesando portada tipo imagen: ${fileExtension}`);
            coverDoc = await PDFDocument.create();
            // Usar PageSizes.A4 o las dimensiones que prefieras para la página de portada
            const page = coverDoc.addPage(PageSizes.A4);

            let imageEmbed;
            if (fileExtension === 'png') {
                imageEmbed = await coverDoc.embedPng(coverBuffer);
            } else { // jpg, jpeg
                imageEmbed = await coverDoc.embedJpg(coverBuffer);
            }

            const { width: imgWidth, height: imgHeight } = imageEmbed.scale(1); // Dimensiones intrínsecas de la imagen
            const { width: pageWidth, height: pageHeight } = page.getSize();

            // Calcular dimensiones para escalar la imagen a la página manteniendo el aspect ratio
            // y cubriendo la mayor área posible (similar a background-size: contain)
            const xScale = pageWidth / imgWidth;
            const yScale = pageHeight / imgHeight;
            const scale = Math.min(xScale, yScale); // Escala para que la imagen quepa entera

            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;

            // Centrar la imagen en la página
            const x = (pageWidth - scaledWidth) / 2;
            const y = (pageHeight - scaledHeight) / 2;

            page.drawImage(imageEmbed, {
                x,
                y,
                width: scaledWidth,
                height: scaledHeight,
            });
            console.log("Portada de imagen convertida a PDF de 1 página.");

        } else if (fileExtension === 'pdf') {
            console.log("Procesando portada tipo PDF.");
            coverDoc = await PDFDocument.load(coverBuffer);
        } else {
            console.warn(`Tipo de archivo de portada no soportado: '${fileExtension}' para la clave '${coverKey}'. Se omitirá la portada.`);
            return contentBuffer; // Devolver el contenido original si el tipo no es soportado
        }
    } catch (processingError) {
        console.error(`Error al procesar el buffer de la portada '${coverKey}' (tipo: ${fileExtension}):`, processingError);
        // Si hay un error cargando/embebendo la imagen o cargando el PDF de portada,
        // devolvemos el contenido original para no interrumpir todo el proceso.
        return contentBuffer;
    }

    // Si por alguna razón coverDoc no se creó (aunque los try/catch anteriores deberían manejarlo)
    if (!coverDoc) {
        console.warn("No se pudo crear el documento PDF de la portada. Se omitirá la portada.");
        return contentBuffer;
    }

    // Cargar el documento PDF del contenido principal
    const contentDoc = await PDFDocument.load(contentBuffer);

    // Crear un nuevo documento PDF para el resultado final
    const mergedDoc = await PDFDocument.create();

    // Copiar páginas de la portada (coverDoc ahora siempre es un PDFDocument)
    const coverPages = await mergedDoc.copyPages(coverDoc, coverDoc.getPageIndices());
    coverPages.forEach(p => mergedDoc.addPage(p));

    // Copiar páginas del contenido
    const contentPages = await mergedDoc.copyPages(contentDoc, contentDoc.getPageIndices());
    contentPages.forEach(p => mergedDoc.addPage(p));

    console.log("Portada y contenido fusionados correctamente.");
    const mergedBytes = await mergedDoc.save();
    return Buffer.from(mergedBytes);
}

module.exports = { prependCoverPdf };