const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter"); // Asegúrate que Chapter está importado
const crypto = require("crypto");

const { generateCertificatePdf } = require("../services/certificateService");

exports.generateCertificate = async (req, res) => {
    try {
        const loggedInUserId = req.user.id; // ID del usuario que realiza la acción (admin)
        const { bookId, chapterId, type, targetUserId } = req.body; // targetUserId es opcional

        if (!bookId || !type) {
            return res.status(400).json({ message: "Faltan parámetros obligatorios (bookId, type)." });
        }
        if (type === "chapter_author" && !chapterId) {
            return res.status(400).json({ message: "Falta chapterId para el tipo chapter_author." });
        }

        let finalUserIdForCertificate;
        let userForCertificate; // Usuario para quien es el certificado
        let chapter = null;
        let coAuthors = null;

        const book = await Book.findByPk(bookId, {
            include: (type === "book_author" && !targetUserId) ? [{ model: User, as: "coAuthors" }] : []
        });

        if (!book) {
            return res.status(404).json({ message: "Libro no encontrado." });
        }

        if (type === "chapter_author") {
            chapter = await Chapter.findOne({ where: { id: chapterId, bookId } });
            if (!chapter) {
                return res.status(404).json({ message: "Capítulo no encontrado." });
            }
            // Para certificados de capítulo, el userId del certificado DEBE SER el authorId del capítulo.
            finalUserIdForCertificate = chapter.authorId;
            userForCertificate = await User.findByPk(finalUserIdForCertificate);
            if (!userForCertificate) {
                return res.status(404).json({ message: `Autor del capítulo (ID: ${finalUserIdForCertificate}) no encontrado.` });
            }
        } else if (type === "book_author") {
            // Si se proporciona un targetUserId, el certificado es para ese usuario específico (coautor).
            // Si no, y el libro tiene un authorId principal, es para ese autor.
            // O podría ser para req.user.id si el admin se está generando un certificado de libro para sí mismo (menos común para este flujo).
            // Para certificados de libro, la lógica puede ser más compleja si hay múltiples autores.
            // Aquí asumimos que si es book_author y no se especifica targetUserId, es para el autor principal del libro.
            finalUserIdForCertificate = targetUserId || book.authorId || loggedInUserId; // Decidir la prioridad
            userForCertificate = await User.findByPk(finalUserIdForCertificate);
            if (!userForCertificate) {
                return res.status(404).json({ message: `Usuario para certificado de libro (ID: ${finalUserIdForCertificate}) no encontrado.` });
            }
            // Si el libro tiene coAutores y el certificado es para el libro completo (no un coautor específico via targetUserId),
            // entonces coAuthors se usa en el PDF. Si es para un targetUserId, coAuthors no se pasa a generateCertificatePdf.
            if (!targetUserId) {
                coAuthors = book.coAuthors; // array de usuarios
            }

        } else {
            // Otros tipos de certificados podrían usar loggedInUserId o un targetUserId explícito
            finalUserIdForCertificate = targetUserId || loggedInUserId;
            userForCertificate = await User.findByPk(finalUserIdForCertificate);
            if (!userForCertificate) {
                return res.status(404).json({ message: `Usuario (ID: ${finalUserIdForCertificate}) no encontrado.` });
            }
        }

        const verifyHash = crypto.randomBytes(16).toString("hex");
        const issueDate = new Date();

        const { url: documentUrl } = await generateCertificatePdf({
            type,
            user: userForCertificate, // Usar el usuario correcto para el PDF
            book,
            chapter, // será null si type no es chapter_author
            coAuthors, // será null si no es book_author para el autor principal o si targetUserId está presente
            issueDate,
            verifyHash
        });

        const cert = await Certificate.create({
            userId: finalUserIdForCertificate, // <--- USA EL ID DEL AUTOR REAL DEL CAPÍTULO O LIBRO
            bookId,
            chapterId: chapterId || null,
            type,
            content: JSON.stringify({ bookId, chapterId, issueDate, targetUserId: finalUserIdForCertificate }), // Guardar el userId al que pertenece
            verifyHash,
            documentUrl,
            status: "generated",
            issuedAt: issueDate
        });

        return res.status(201).json({ message: "Certificado generado.", certificate: cert });
    } catch (err) {
        console.error("Error al generar certificado:", err); // Loguea el error completo
        return res.status(500).json({ error: err.message });
    }
};

// Obtiene todos los certificados de un usuario específico
exports.getCertificatesByUser = async (req, res) => {
    try {
        const { userId } = req.params; // Este userId es el del usuario cuyos certificados se quieren ver
        const certificates = await Certificate.findAll({ where: { userId } });
        // Aquí, el frontend (OwnChaptersPage) debe llamar con el userId del AUTOR, no del admin.
        res.status(200).json(certificates);
    } catch (err) {
        console.error("Error al obtener certificados por usuario:", err);
        res.status(500).json({ error: err.message });
    }
};