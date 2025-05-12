const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const { generateCertificatePdf } = require("../services/certificateService");

// Genera un certificado para un usuario
exports.generateCertificate = async (req, res) => {
    try {
        // 1️⃣ userId viene del token (middleware auth must set req.user.id)
        const userId = req.user.id;
        const { bookId, chapterId } = req.body;

        // 2️⃣ Validamos sólo bookId y chapterId
        if (!bookId || !chapterId) {
            return res
                .status(400)
                .json({ message: "Faltan parámetros obligatorios: bookId o chapterId." });
        }

        // 3️⃣ Cargamos datos
        const [user, book, chapter] = await Promise.all([
            User.findByPk(userId),
            Book.findByPk(bookId),
            Chapter.findOne({ where: { id: chapterId, bookId } }),
        ]);
        if (!user || !book || !chapter) {
            return res
                .status(404)
                .json({ message: "Usuario, libro o capítulo no encontrado." });
        }

        // 4️⃣ Generamos hash y PDF
        const verifyHash = crypto.randomBytes(16).toString("hex");
        const issueDate = new Date();
        const { url: documentUrl } = await generateCertificatePdf({
            user,
            book,
            chapter,
            issueDate,
            verifyHash,
        });

        // 5️⃣ Guardamos en BD
        const certificate = await Certificate.create({
            userId,
            bookId,
            chapterId,
            type: "chapter_author",
            content: JSON.stringify({ bookId, chapterId, issueDate }),
            verifyHash,
            documentUrl,
            status: "generated",
            issuedAt: issueDate,
        });

        // 6️⃣ Respondemos
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
