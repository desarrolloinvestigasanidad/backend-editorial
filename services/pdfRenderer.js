const pCore = require("puppeteer-core");
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

async function htmlToPdfBuffer(html) {
    const browser = await pCore.launch({
        headless: true,
        executablePath,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ]
    });

    const page = await browser.newPage();

    // Opcional: si quieres garantizar Times New Roman…
    await page.evaluateOnNewDocument(() => {
        document.fonts.ready.then(() => {
            if (!document.fonts.check('12px "Times New Roman"')) {
                console.warn("Times New Roman no está disponible, usando serif");
            }
        });
    });

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "25mm", bottom: "25mm", left: "25mm", right: "25mm" },
        displayHeaderFooter: true,
        headerTemplate: "<div></div>",
        footerTemplate: `
      <div style="
        width:100%;text-align:center;
        font-size:10pt;font-family:'Times New Roman',Times,serif;
        padding:0 25mm;
      ">
        <span class="pageNumber"></span>
      </div>`
    });

    await browser.close();
    return pdfBuffer;
}

module.exports = { htmlToPdfBuffer };
