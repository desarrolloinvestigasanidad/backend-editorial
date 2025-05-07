// services/pdfMerge.js
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const fs = require("fs/promises");
const path = require("path");

async function mergeCoverAndContent(coverUrl, contentBuffer, bookTitle) {
    // 1️⃣ Descarga y carga la portada
    const coverRes = await fetch(coverUrl);
    if (!coverRes.ok) throw new Error("No se pudo descargar la portada");
    const coverBytes = await coverRes.arrayBuffer();
    const coverDoc = await PDFDocument.load(coverBytes);

    // 2️⃣ Carga el contenido generado
    const contentDoc = await PDFDocument.load(contentBuffer);

    // 3️⃣ Crea documento final
    const mergedDoc = await PDFDocument.create();

    // 4️⃣ Copia las páginas de la portada
    const coverPages = await mergedDoc.copyPages(
        coverDoc,
        coverDoc.getPageIndices()
    );
    coverPages.forEach((p) => mergedDoc.addPage(p));

    // 5️⃣ Inserta UNA página en blanco del mismo tamaño
    const { width, height } = coverDoc.getPage(0).getSize();
    mergedDoc.addPage([width, height]);

    // 6️⃣ Página de TÍTULO + logos
    const titlePage = mergedDoc.addPage([width, height]);

    // 6.1️⃣ Dibuja el título centrado
    const timesFont = await mergedDoc.embedFont(StandardFonts.TimesRoman);
    const text = bookTitle.toUpperCase();
    const fontSize = 28;
    const textWidth = timesFont.widthOfTextAtSize(text, fontSize);
    titlePage.drawText(text, {
        x: (width - textWidth) / 2,
        y: height - 100,
        size: fontSize,
        font: timesFont,
        color: rgb(0, 0, 0),
    });

    // 6.2️⃣ Incrusta y dibuja el logo dos veces
    const logoPath = path.join(__dirname, "../public/logos/logois.jpg");
    const logoBytes = await fs.readFile(logoPath);
    const logoImage = await mergedDoc.embedJpg(logoBytes);
    const logoDims = logoImage.scale(0.5);
    const gap = 20;
    const totalLogosWidth = logoDims.width * 2 + gap;
    const startX = (width - totalLogosWidth) / 2;
    const logoY = height - 200;

    titlePage.drawImage(logoImage, {
        x: startX,
        y: logoY,
        width: logoDims.width,
        height: logoDims.height,
    });
    titlePage.drawImage(logoImage, {
        x: startX + logoDims.width + gap,
        y: logoY,
        width: logoDims.width,
        height: logoDims.height,
    });

    // 7️⃣ Copia el resto de páginas (índice + contenido)
    const contentPages = await mergedDoc.copyPages(
        contentDoc,
        contentDoc.getPageIndices()
    );
    contentPages.forEach((p) => mergedDoc.addPage(p));

    // 8️⃣ Serializa y devuelve el buffer
    const mergedBytes = await mergedDoc.save();
    return Buffer.from(mergedBytes);
}

module.exports = { mergeCoverAndContent };
