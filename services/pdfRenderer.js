const pCore = require("puppeteer-core");
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

async function htmlToPdfBuffer(html, showPageNumbers = false) {
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

  // Establecer contenido HTML
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "25mm", bottom: "25mm", left: "25mm", right: "25mm" },
    displayHeaderFooter: showPageNumbers,
    headerTemplate: "<div></div>",
    footerTemplate: showPageNumbers
      ? `<div style="width:100%;text-align:center;font-size:10pt;font-family:'Calibri', Times, serif;padding:0 25mm;">
                    <span class="pageNumber"></span>
               </div>`
      : "<div></div>"
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { htmlToPdfBuffer };
