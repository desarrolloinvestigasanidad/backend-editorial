const Chapter = require("../models/Chapter.js");
const User = require("../models/User.js");
const Book = require("../models/Book.js");
const Edition = require("../models/Edition.js");
const ChapterPurchase = require("../models/ChapterPurchase.js");
const { getChapterAcceptedEmailTemplate, getChapterRejectedEmailTemplate } = require("../templates/emailTemplates.js");
const sendgrid = require("@sendgrid/mail"); // <-- Agrega esta importación si usas Sendgrid

// Obtener todos los capítulos propios
export const getAllOwnChapters = async (req, res) => {
    try {
        const { authorId, bookId } = req.query;
        const where = {};
        if (authorId) where.authorId = authorId;
        if (bookId) where.bookId = bookId;

        const chapters = await Chapter.findAll({ where });
        res.status(200).json(chapters);
    } catch (err) {
        console.error("Error en getAllOwnChapters:", err);
        res.status(500).json({ error: err.message });
    }
};

// Obtener un capítulo propio por su id
export const getOneOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        res.status(200).json(chapter);
    } catch (err) {
        console.error("Error en getOneOwnChapter:", err);
        res.status(500).json({ error: err.message });
    }
};

// Crear un capítulo propio
export const createOwnChapter = async (req, res) => {
    try {
        const { title, studyType, methodology, introduction, objectives, results, discussion, bibliography, authorId, bookId } = req.body;
        if (!title || !studyType || !methodology || !introduction || !objectives || !results || !discussion || !bibliography || !authorId) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }
        const newChapter = await Chapter.create({
            title,
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            authorId,
            editionId: null,
            bookId,
            status: "pendiente",
            rejectionReason: null
        });
        res.status(201).json({ message: "Capítulo propio creado.", chapter: newChapter });
    } catch (err) {
        console.error("Error en createOwnChapter:", err);
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un capítulo propio
export const updateOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const {
            title, studyType, methodology, introduction, objectives,
            results, discussion, bibliography, status, rejectionReason,
        } = req.body;

        const chapter = await Chapter.findByPk(chapterId, {
            include: [
                {
                    model: Book,
                    attributes: ['title', 'editionId'],
                    include: [{ model: Edition, attributes: ['title'] }]
                },
                {
                    model: User,
                    attributes: ['id', 'firstName', 'email']
                }
            ]
        });

        if (!chapter) {
            return res.status(404).json({ message: "Capítulo no encontrado." });
        }

        const previousStatus = chapter.status;
        const newStatus = status;

        const dataToUpdate = {
            title, studyType, methodology, introduction, objectives,
            results, discussion, bibliography, status,
            rejectionReason: newStatus === "rechazado" ? rejectionReason : null,
        };

        await chapter.update(dataToUpdate);
        const updatedChapter = await chapter.reload();

        if (newStatus !== previousStatus && (newStatus === "aprobado" || newStatus === "rechazado")) {
            const author = updatedChapter.User;
            const book = updatedChapter.Book;
            const edition = book?.Edition;

            if (author && author.email) {
                let emailData;
                let contextLabel = book ? `para el libro "${book.title}"${edition ? ` (edición: "${edition.title}")` : ""}` : "para tu publicación";

                if (newStatus === "aprobado") {
                    emailData = getChapterAcceptedEmailTemplate(author.firstName, updatedChapter.title, contextLabel);
                } else {
                    emailData = getChapterRejectedEmailTemplate(author.firstName, updatedChapter.title, rejectionReason, contextLabel);
                }

                if (emailData) {
                    try {
                        await sendgrid.send({
                            to: author.email,
                            from: {
                                email: process.env.SENDGRID_FROM_EMAIL,
                                name: "Investiga Sanidad",
                            },
                            subject: emailData.subject,
                            html: emailData.html,
                        });
                        console.log(`Correo enviado a ${author.email}`);
                    } catch (emailError) {
                        console.error("Error al enviar correo:", emailError);
                    }
                }
            }
        }

        res.status(200).json({ message: "Capítulo actualizado.", chapter: updatedChapter });
    } catch (err) {
        console.error("Error en updateOwnChapter:", err);
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un capítulo propio
export const deleteOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Capítulo no encontrado." });
        }
        await chapter.destroy();
        res.status(200).json({ message: "Capítulo eliminado." });
    } catch (err) {
        console.error("Error en deleteOwnChapter:", err);
        res.status(500).json({ error: err.message });
    }
};

// Listar compras de capítulos
export const listChapterPurchases = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "Falta el parámetro userId." });
        }
        const purchases = await ChapterPurchase.findAll({ where: { userId } });
        res.status(200).json({ chapter_purchases: purchases });
    } catch (err) {
        console.error("Error fetching chapter purchases:", err);
        res.status(500).json({ error: err.message });
    }
};
