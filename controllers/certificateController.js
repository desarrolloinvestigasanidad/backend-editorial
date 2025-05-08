const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const { generateCertificatePdf } = require("../services/certificateService");

// Genera un certificado para un usuario
exports.generateCertificate = async (req, res) => {
    try {
        const { userId, bookId, chapterId } = req.body;
        if (!userId || !bookId || !chapterId) {
            return res.status(400).json({ message: "Faltan parámetros obligatorios." });
        }

        // 1️⃣ Obtener datos
        const user = await User.findByPk(userId);
        const book = await Book.findByPk(bookId);
        const chapter = (await Chapter.findAll({ where: { bookId, id: chapterId } }))[0];
        if (!user || !book || !chapter) {
            return res.status(404).json({ message: "Usuario, libro o capítulo no encontrado." });
        }

        // 2️⃣ Generar PDF
        const issueDate = new Date();                         // fecha de emisión
        const validationUrl = `${process.env.APP_URL}/validar/${chapterId}`;
        const { url } = await generateCertificatePdf({ user, book, chapter, issueDate, validationUrl });

        // 3️⃣ Guardar en BD
        const certificate = await Certificate.create({
            userId,
            type: "chapter_author",
            content: JSON.stringify({ bookId, chapterId, issueDate }),
            documentUrl: url,
            status: "generated",
        });

        // 4️⃣ Responder
        res.status(201).json({ message: "Certificado generado.", certificate });
    } catch (err) {
        console.error("Error al generar certificado:", err);
        res.status(500).json({ error: err.message });
    }
};

// Obtiene todos los certificados de un usuario específico
exports.getCertificatesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const certificates = await Certificate.findAll({ where: { userId } });
        res.status(200).json(certificates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
