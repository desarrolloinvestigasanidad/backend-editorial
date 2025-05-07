// services/pdfRenderer.js
const chromium = require("chrome-aws-lambda");
const pCore = require("puppeteer-core");
let puppeteer;

// Detectamos entorno: si NO es production, usamos puppeteer normal
const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
    // en dev instalamos puppeteer completo
    puppeteer = require("puppeteer");
} else {
    // en prod usamos puppeteer-core + chrome-aws-lambda
    puppeteer = pCore;
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
        };

    const browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    await browser.close();
    return pdfBuffer;
}

module.exports = { htmlToPdfBuffer };
