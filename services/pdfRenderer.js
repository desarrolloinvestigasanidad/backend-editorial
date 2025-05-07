// services/pdfRenderer.js
const chromium = require("chrome-aws-lambda")
const pCore = require("puppeteer-core")
let puppeteer

// Detectamos entorno: si NO es production, usamos puppeteer normal
const isDev = process.env.NODE_ENV !== "production"

if (isDev) {
    // en dev instalamos puppeteer completo
    puppeteer = require("puppeteer")
} else {
    // en prod usamos puppeteer-core + chrome-aws-lambda
    puppeteer = pCore
}

async function htmlToPdfBuffer(html) {
    // Montamos las opciones de lanzamiento
    const launchOpts = isDev
        ? {
            headless: true,
        }
        : {
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        }

    const browser = await puppeteer.launch(launchOpts)
    const page = await browser.newPage()

    // Configurar fuentes para asegurar que Times New Roman esté disponible
    await page.evaluateOnNewDocument(() => {
        // Intentar cargar Times New Roman si está disponible en el sistema
        document.fonts.ready.then(() => {
            if (!document.fonts.check('12px "Times New Roman"')) {
                console.warn("Times New Roman no está disponible, usando serif como fallback")
            }
        })
    })

    await page.setContent(html, { waitUntil: "networkidle0" })

    // Configurar opciones de PDF para que coincida con el formato deseado
    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "25mm", bottom: "25mm", left: "25mm", right: "25mm" },
        displayHeaderFooter: true,
        footerTemplate: `
      <div style="width: 100%; text-align: center; font-size: 10pt; font-family: 'Times New Roman', Times, serif; color: #000; padding: 0 25mm;">
        <span class="pageNumber"></span>
      </div>
    `,
        headerTemplate: "<div></div>",
    })

    await browser.close()
    return pdfBuffer
}

module.exports = { htmlToPdfBuffer }
