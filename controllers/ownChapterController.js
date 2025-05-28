// backend-editorial\controllers\ownChapterController.js

const Chapter = require("../models/Chapter");
const User = require("../models/User"); // Necesario para obtener datos del autor
const Book = require("../models/Book");   // Necesario para el título del libro
const Edition = require("../models/Edition");
const ChapterPurchase = require("../models/ChapterPurchase");

// Obtener todos los capítulos propios (sin editionId ni bookId)
exports.getAllOwnChapters = async (req, res) => {
    try {
        const { authorId, bookId } = req.query;
        // Construyo dinámicamente el filtro
        const where = {};
        if (authorId) where.authorId = authorId;
        if (bookId) where.bookId = bookId;

        const chapters = await Chapter.findAll({ where });
        res.status(200).json(chapters);
    } catch (err) {
        console.error("Error en getAllOwnChapters:", err); // Añadido para mejor depuración
        res.status(500).json({ error: err.message });
    }
};


// Obtener un capítulo propio por su id
exports.getOneOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
        res.status(200).json(chapter);
    } catch (err) {
        console.error("Error en getOneOwnChapter:", err); // Añadido para mejor depuración
        res.status(500).json({ error: err.message });
    }
};

// Crear un capítulo propio
exports.createOwnChapter = async (req, res) => {
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
            bookId, // Asegúrate que bookId puede ser null si el capítulo no está asociado a un libro inicialmente
            status: "pendiente", // O el estado inicial que prefieras
            rejectionReason: null // Inicialmente no hay motivo de rechazo
        });
        res.status(201).json({ message: "Capítulo propio creado.", chapter: newChapter });
    } catch (err) {
        console.error("Error en createOwnChapter:", err); // Añadido para mejor depuración
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un capítulo propio
exports.updateOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const {
            title, studyType, methodology, introduction, objectives,
            results, discussion, bibliography, status, rejectionReason,
            // No necesitamos bookId o authorId aquí ya que son parte del capítulo existente
        } = req.body;

        const chapter = await Chapter.findByPk(chapterId, {
            include: [ // Incluir el libro para obtener su título y el ID de la edición
                {
                    model: Book,
                    attributes: ['title', 'editionId'], // Solo necesitamos el título del libro y el ID de la edición
                    include: [{ model: Edition, attributes: ['title'] }] // Incluir la edición para su título
                },
                {
                    model: User, // Incluir el autor para su email y nombre
                    attributes: ['id', 'firstName', 'email']
                }
            ]
        });

        if (!chapter) {
            return res.status(404).json({ message: "Capítulo no encontrado." });
        }

        const previousStatus = chapter.status; // Guardar el estado anterior
        const newStatus = status;

        const dataToUpdate = {
            title, studyType, methodology, introduction, objectives,
            results, discussion, bibliography, status,
            rejectionReason: newStatus === "rechazado" ? rejectionReason : null,
        };

        await chapter.update(dataToUpdate);
        const updatedChapter = await chapter.reload(); // Recargar para tener los datos actualizados, incluyendo asociaciones

        // Lógica para enviar correo si el estado ha cambiado a aprobado o rechazado
        if (newStatus !== previousStatus && (newStatus === "aprobado" || newStatus === "rechazado")) {
            const author = updatedChapter.User; // El autor ya está incluido
            const book = updatedChapter.Book;   // El libro ya está incluido
            const edition = book?.Edition;      // La edición está anidada en el libro

            if (author && author.email) {
                let emailData;
                let contextLabel = "";
                if (book) {
                    contextLabel += `para el libro "${book.title}"`;
                    if (edition) {
                        contextLabel += ` (edición: "${edition.title}")`;
                    }
                } else {
                    contextLabel = "para tu publicación"; // Fallback
                }

                if (newStatus === "aprobado") {
                    emailData = getChapterAcceptedEmailTemplate(
                        author.firstName || "Usuario",
                        updatedChapter.title,
                        contextLabel
                    );
                } else if (newStatus === "rechazado") {
                    emailData = getChapterRejectedEmailTemplate(
                        author.firstName || "Usuario",
                        updatedChapter.title,
                        updatedChapter.rejectionReason || "No se especificó un motivo.",
                        contextLabel
                    );
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
                        console.log(`Correo de estado de capítulo (${newStatus}) enviado a ${author.email}`);
                    } catch (emailError) {
                        console.error("Error al enviar correo de estado de capítulo:", emailError.response?.body || emailError);
                        // No hacer que la actualización falle por el email, pero sí loguearlo.
                    }
                }
            } else {
                console.warn(`No se pudo enviar correo para el capítulo ${updatedChapter.id}: autor o email no encontrado.`);
            }
        }

        res.status(200).json({ message: "Capítulo actualizado.", chapter: updatedChapter });
    } catch (err) {
        console.error("Error en updateOwnChapter:", err);
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un capítulo propio
exports.deleteOwnChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Capítulo no encontrado." });
        }
        await chapter.destroy();
        res.status(200).json({ message: "Capítulo propio eliminado." });
    } catch (err) {
        console.error("Error en deleteOwnChapter:", err); // Añadido para mejor depuración
        res.status(500).json({ error: err.message });
    }
};

exports.listChapterPurchases = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "Missing userId query parameter." });
        }

        const purchases = await ChapterPurchase.findAll({
            where: { userId },
        });

        res.status(200).json({ chapter_purchases: purchases }); // Modificado para que coincida con el frontend si es necesario
    } catch (err) {
        console.error("Error fetching chapter purchases:", err);
        res.status(500).json({ error: err.message });
    }
};
