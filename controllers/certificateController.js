const { Certificate } = require("../models");
const User = require("../models/User");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const crypto = require("crypto");

const { generateCertificatePdf } = require("../services/certificateService");

exports.generateCertificate = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const { bookId, chapterId, type, targetUserId } = req.body;

        if (!bookId || !type) {
            return res.status(400).json({ message: "Faltan parámetros obligatorios (bookId, type)." });
        }

        if (type === "chapter_author" && !chapterId) {
            return res.status(400).json({ message: "Falta chapterId para el tipo chapter_author." });
        }

        let finalUserIdForCertificate;
        let userForCertificate;
        let chapter = null;
        let coAuthors = null;
        let authors = null;

        const book = await Book.findByPk(bookId, {
            include: (type === "book_author" && !targetUserId) ? [{ model: User, as: "coAuthors" }] : []
        });

        if (!book) {
            return res.status(404).json({ message: "Libro no encontrado." });
        }

        const issueDate = new Date();
        book.publishDate = issueDate;

        const chapterCode = `${String(issueDate.getMonth() + 1).padStart(2, "0")}${String(issueDate.getFullYear()).slice(-2)}`;
        const verifyHash = crypto.randomBytes(16).toString("hex");

        if (type === "chapter_author") {
            chapter = await Chapter.findOne({
                where: { id: chapterId, bookId },
                include: [{ model: User, as: "authors" }]
            });

            if (!chapter) {
                return res.status(404).json({ message: "Capítulo no encontrado." });
            }

            finalUserIdForCertificate = chapter.authorId;
            userForCertificate = await User.findByPk(finalUserIdForCertificate);

            if (!userForCertificate) {
                return res.status(404).json({ message: `Autor del capítulo (ID: ${finalUserIdForCertificate}) no encontrado.` });
            }

            authors = [
                {
                    name: `${userForCertificate.firstName} ${userForCertificate.lastName}`,
                    dni: userForCertificate.dni || userForCertificate.id
                },
                ...chapter.authors.map(a => ({
                    name: `${a.firstName} ${a.lastName}`,
                    dni: a.dni || a.id
                }))
            ];

            const { url: documentUrl } = await generateCertificatePdf({
                type,
                user: userForCertificate,
                book,
                chapter,
                coAuthors: null,
                issueDate,
                verifyHash,
                chapterCode,
                authors
            });

            const cert = await Certificate.create({
                userId: finalUserIdForCertificate,
                bookId,
                chapterId,
                type,
                content: JSON.stringify({ bookId, chapterId, issueDate, targetUserId: finalUserIdForCertificate }),
                verifyHash,
                documentUrl,
                status: "generated",
                issuedAt: issueDate
            });

            return res.status(201).json({ message: "Certificado generado.", certificate: cert });
        }

        if (type === "book_author") {
            if (targetUserId) {
                finalUserIdForCertificate = targetUserId;
            } else if (book.authorId) {
                finalUserIdForCertificate = book.authorId;
            } else if (book.coAuthors && book.coAuthors.length > 0) {
                finalUserIdForCertificate = book.coAuthors[0].id;
            } else {
                return res.status(400).json({ message: "No se puede determinar el autor del libro." });
            }

            userForCertificate = await User.findByPk(finalUserIdForCertificate);

            if (!userForCertificate) {
                return res.status(404).json({ message: `Usuario para certificado de libro (ID: ${finalUserIdForCertificate}) no encontrado.` });
            }

            if (!targetUserId) {
                coAuthors = book.coAuthors;
            }

            const { url: documentUrl } = await generateCertificatePdf({
                type,
                user: userForCertificate,
                book,
                chapter: null,
                coAuthors,
                issueDate,
                verifyHash
            });

            const cert = await Certificate.create({
                userId: finalUserIdForCertificate,
                bookId,
                chapterId: null,
                type,
                content: JSON.stringify({ bookId, chapterId: null, issueDate, targetUserId: finalUserIdForCertificate }),
                verifyHash,
                documentUrl,
                status: "generated",
                issuedAt: issueDate
            });

            return res.status(201).json({ message: "Certificado generado.", certificate: cert });
        }

        // Otros tipos de certificado
        finalUserIdForCertificate = targetUserId || loggedInUserId;
        userForCertificate = await User.findByPk(finalUserIdForCertificate);

        if (!userForCertificate) {
            return res.status(404).json({ message: `Usuario (ID: ${finalUserIdForCertificate}) no encontrado.` });
        }

        const { url: documentUrl } = await generateCertificatePdf({
            type,
            user: userForCertificate,
            book,
            chapter: null,
            coAuthors: null,
            issueDate,
            verifyHash
        });

        const cert = await Certificate.create({
            userId: finalUserIdForCertificate,
            bookId,
            chapterId: null,
            type,
            content: JSON.stringify({ bookId, chapterId: null, issueDate, targetUserId: finalUserIdForCertificate }),
            verifyHash,
            documentUrl,
            status: "generated",
            issuedAt: issueDate
        });

        return res.status(201).json({ message: "Certificado generado.", certificate: cert });
    } catch (err) {
        console.error("Error al generar certificado:", err);
        return res.status(500).json({ error: err.message });
    }
};

// ✅ Listar certificados de un usuario con títulos de libro y capítulo
exports.getCertificatesByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const certificates = await Certificate.findAll({
            where: { userId },
            include: [
                {
                    model: Book,
                    as: "book",
                    attributes: ["title"],
                },
                {
                    model: Chapter,
                    as: "chapter",
                    attributes: ["title"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const enriched = certificates.map(cert => ({
            ...cert.toJSON(),
            bookTitle: cert.book?.title || null,
            chapterTitle: cert.chapter?.title || null,
        }));

        res.status(200).json(enriched);
    } catch (err) {
        console.error("Error al obtener certificados por usuario:", err);
        res.status(500).json({ error: err.message });
    }
};
