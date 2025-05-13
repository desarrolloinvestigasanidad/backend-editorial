const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const crypto = require("crypto");

const { generateCertificatePdf } = require("../services/certificateService");

// Genera un certificado para un usuario
exports.generateCertificate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId, chapterId, type } = req.body;
        if (!bookId || !type || (type === "chapter_author" && !chapterId)) {
            return res.status(400).json({ message: "Faltan parámetros obligatorios." });
        }

        // cargar datos comunes
        const [user, book] = await Promise.all([
            User.findByPk(userId),
            Book.findByPk(bookId, { include: type === "book_author" ? [{ model: User, as: "coAuthors" }] : [] })
        ]);
        if (!user || !book) {
            return res.status(404).json({ message: "Usuario o libro no encontrado." });
        }

        let chapter = null, coAuthors = null;
        if (type === "chapter_author") {
            chapter = await Chapter.findOne({ where: { id: chapterId, bookId } });
            if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        } else {
            coAuthors = book.coAuthors; // array de usuarios
        }

        const verifyHash = crypto.randomBytes(16).toString("hex");
        const issueDate = new Date();

        // generamos PDF + subimos y nos devuelve { url }
        const { url: documentUrl } = await generateCertificatePdf({
            type, user, book, chapter, coAuthors, issueDate, verifyHash
        });

        // guardamos en BD
        const cert = await Certificate.create({
            userId, bookId, chapterId: chapterId || null,
            type, content: JSON.stringify({ bookId, chapterId, issueDate }),
            verifyHash, documentUrl, status: "generated", issuedAt: issueDate
        });

        return res.status(201).json({ message: "Certificado generado.", certificate: cert });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
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
