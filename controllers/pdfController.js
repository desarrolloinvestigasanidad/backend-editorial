const PDFDocument = require("pdfkit");

exports.generateChapterPDF = async (req, res) => {
    try {
        const { chapterId } = req.params;
        // Aquí se obtendrían los datos del capítulo para armar el PDF.
        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        doc.text(`PDF del capítulo: ${chapterId}`);
        doc.pipe(res);
        doc.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.generateBookPDF = async (req, res) => {
    try {
        const { bookId } = req.params;
        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        doc.text(`PDF del libro: ${bookId}`);
        doc.pipe(res);
        doc.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
