// services/watermarkService.js
const { PDFDocument, rgb, StandardFonts, degrees } = require("pdf-lib")

/**
 * Adds a watermark to each page of the PDF
 */
async function addWatermark(pdfBuffer, watermarkText = "BORRADOR") {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pages = pdfDoc.getPages()

    // Load a standard font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Add watermark to each page
    pages.forEach((page) => {
        const { width, height } = page.getSize()

        // Draw diagonal watermark
        page.drawText(watermarkText, {
            x: width / 2 - 150,
            y: height / 2,
            size: 60,
            font: helveticaFont,
            color: rgb(0.8, 0.8, 0.8),
            opacity: 0.3,
            rotate: degrees(45),
        })
    })

    // Save the PDF
    const watermarkedPdfBytes = await pdfDoc.save()
    return Buffer.from(watermarkedPdfBytes)
}

module.exports = { addWatermark }
