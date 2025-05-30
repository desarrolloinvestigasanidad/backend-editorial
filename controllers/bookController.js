// controllers/bookController.js
const Book = require("../models/Book");
const Edition = require("../models/Edition");
const Chapter = require("../models/Chapter");
const User = require("../models/User");

const sendgrid = require("@sendgrid/mail");
const {
    getChapterSubmissionEmailTemplate
} = require("../templates/emailTemplates");
const fs = require("fs");
const path = require("path");
const PDFKit = require("pdfkit");
const hbs = require("handlebars");

const { uploadPDF, uploadFile, getPDFUrl } = require("../services/s3Service");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

exports.createBookForEdition = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            price,
            isbn,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            interests,
            editionId,
        } = req.body;
        // Asumimos que authorId es nulo
        const authorId = null;

        if (!title) {
            return res
                .status(400)
                .json({ message: "Campos obligatorios faltantes: título " });
        }
        const priceValue = price != null && price !== "" ? Number(price) : 0;
        const newBook = await Book.create({
            editionId,
            title,
            subtitle: subtitle || null,
            price: priceValue,
            isbn: isbn && isbn.trim() !== "" ? isbn : null,
            cover: cover || null,
            openDate: openDate || null,
            deadlineChapters: deadlineChapters || null,
            publishDate: publishDate || null,
            interests: interests || null,
            bookType: "libro edición", // Valor por defecto
            status: "pendiente", // Valor por defecto
            active: true, // Valor por defecto
            authorId,
        });

        res.status(201).json({ message: "Libro creado.", book: newBook });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Listar libros de una edición
exports.getBooksForEdition = async (req, res) => {
    try {
        const { id: editionId } = req.params;
        const edition = await Edition.findByPk(editionId);
        if (!edition)
            return res.status(404).json({ message: "Edición no encontrada." });

        const books = await Book.findAll({ where: { editionId } });
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un libro concreto de la edición
exports.getOneBookFromEdition = async (req, res) => {
    try {
        const { id: editionId, bookId } = req.params;
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book)
            return res
                .status(404)
                .json({ message: "Libro no encontrado en esta edición." });

        res.status(200).json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un libro
exports.updateBookFromEdition = async (req, res) => {
    try {
        const { id: editionId, bookId } = req.params;
        // Se actualizan los campos correspondientes; no olvides que estos pueden incluir los nuevos
        const {
            title,
            subtitle,
            bookType,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            isbn,
            interests,
            price,
            status,
            active,
        } = req.body;

        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book)
            return res
                .status(404)
                .json({ message: "Libro no encontrado en esta edición." });

        await book.update({
            title,
            subtitle,
            bookType,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            isbn,
            interests,
            price,
            status,
            active,
        });
        res.status(200).json({ message: "Libro actualizado.", book });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un libro
exports.deleteBookFromEdition = async (req, res) => {
    try {
        const { id: editionId, bookId } = req.params;
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book)
            return res
                .status(404)
                .json({ message: "Libro no encontrado en esta edición." });

        await book.destroy();
        res.status(200).json({ message: "Libro eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ========================
// Capítulos anidados
// ========================

// Crear un capítulo dentro de un libro de una edición
exports.createChapterForBook = async (req, res) => {
    try {
        // Obtenemos editionId y bookId de los parámetros de la URL
        const { editionId, bookId } = req.params;
        // Extraemos el resto de campos del body
        const {
            title,
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            authorId,
        } = req.body;

        // Validación de campos obligatorios
        if (
            !title ||
            !studyType ||
            !methodology ||
            !introduction ||
            !objectives ||
            !results ||
            !discussion ||
            !bibliography ||
            !authorId
        ) {
            return res
                .status(400)
                .json({ message: "Faltan campos obligatorios para el capítulo." });
        }

        // Verificar que el libro existe y pertenece a la edición
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) {
            return res
                .status(404)
                .json({ message: "Libro no encontrado en esta edición." });
        }

        // Crear capítulo con los campos correspondientes
        const newChapter = await Chapter.create({
            title,
            editionId,
            bookId: book.id, // Usamos el id del libro encontrado
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            authorId,
            content: introduction,
            status: "pendiente", // O cualquier otra lógica para content
        });
        // Enviar correo de "Capítulo Recibido"
        const author = await User.findByPk(authorId, { attributes: ['firstName', 'email'] });

        if (author && author.email && newChapter) {
            let contextLabel = `para el libro "${book.title || 'Desconocido'}"`;
            if (book.Edition) { // Si la edición se incluyó con el libro
                contextLabel += ` (edición: "${book.Edition.title}")`;
            }

            const emailData = getChapterSubmissionEmailTemplate(
                author.firstName || "Estimado/a Autor/a",
                newChapter.title,
                contextLabel
            );

            try {
                await sendgrid.send({
                    to: author.email,
                    from: { email: process.env.SENDGRID_FROM_EMAIL, name: "Investiga Sanidad" },
                    subject: emailData.subject,
                    html: emailData.html,
                });
                console.log(`Correo de capítulo recibido enviado a ${author.email} para capítulo ${newChapter.id}`);
            } catch (emailError) {
                console.error(`Error al enviar correo de capítulo recibido para ${newChapter.id}:`, emailError.response?.body || emailError);
            }
        } else {
            console.warn(`No se pudo enviar correo para nuevo capítulo ${newChapter?.id}: autor, email o libro no encontrado.`);
        }
        res.status(201).json({ message: "Capítulo creado.", chapter: newChapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Listar capítulos de un libro
exports.getChaptersForBook = async (req, res) => {
    try {
        const { id: editionId, bookId } = req.params; // editionId SOLO existe si venimos de /editions

        // Construimos dinámicamente el filtro
        const whereBook = { id: bookId };
        if (editionId !== undefined) whereBook.editionId = editionId; // sólo lo añadimos si está

        const book = await Book.findOne({ where: whereBook });

        if (!book) return res.status(404).json({ message: "Libro no encontrado." });

        const chapters = await Chapter.findAll({ where: { bookId } });
        return res.status(200).json(chapters);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Obtener un capítulo concreto
exports.getOneChapter = async (req, res) => {
    try {
        const { id: editionId, bookId, chapterId } = req.params;
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });

        const chapter = await Chapter.findOne({
            where: { id: chapterId, bookId: book.id },
        });
        if (!chapter)
            return res.status(404).json({ message: "Capítulo no encontrado." });

        res.status(200).json(chapter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un capítulo
exports.updateChapter = async (req, res) => {
    try {
        const { id: editionId, bookId, chapterId } = req.params;
        // Incluir 'methodology' si se desea actualizar también ese campo
        const {
            title,
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            status,
            rejectionReason,
        } = req.body;

        // Verificar que el libro exista en la edición
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });

        // Verificar que el capítulo exista y pertenezca al libro
        const chapter = await Chapter.findOne({
            where: { id: chapterId, bookId: book.id },
        });
        if (!chapter)
            return res.status(404).json({ message: "Capítulo no encontrado." });

        await chapter.update({
            title,
            studyType,
            methodology,
            introduction,
            objectives,
            results,
            discussion,
            bibliography,
            status,
            rejectionReason: status === "rechazado" ? rejectionReason : null,
        });
        res.status(200).json({ message: "Capítulo actualizado.", chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un capítulo
exports.deleteChapter = async (req, res) => {
    try {
        const { id: editionId, bookId, chapterId } = req.params;
        const book = await Book.findOne({ where: { id: bookId, editionId } });
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });

        const chapter = await Chapter.findOne({
            where: { id: chapterId, bookId: book.id },
        });
        if (!chapter)
            return res.status(404).json({ message: "Capítulo no encontrado." });

        await chapter.destroy();
        res.status(200).json({ message: "Capítulo eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Función para obtener todos los libros
exports.getAllBooks = async (req, res) => {
    try {
        let books;
        // Si se pasa el query parameter userId, filtra por ese autor y por libros propios
        if (req.query.userId) {
            books = await Book.findAll({
                where: {
                    authorId: req.query.userId,
                    bookType: "libro propio",
                },
            });
        } else {
            // Sino, retorna todos los libros
            books = await Book.findAll();
        }
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Función para obtener un libro propio por su id
exports.getOneBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });
        res.status(200).json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Función para crear un libro propio
exports.createBook = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            price,
            isbn,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            interests,
        } = req.body;
        if (!title || !price) {
            return res
                .status(400)
                .json({ message: "Campos obligatorios faltantes: título y precio." });
        }
        const newBook = await Book.create({
            editionId: null,
            title,
            subtitle: subtitle || null,
            price: Number(price),
            isbn: isbn && isbn.trim() !== "" ? isbn : null,
            cover: cover || null,
            openDate: openDate || null,
            deadlineChapters: deadlineChapters || null,
            publishDate: publishDate || null,
            interests: interests || null,
            bookType: "libro propio",
            status: "borrador",
            active: true,
            authorId: null,
        });
        res.status(201).json({ message: "Libro propio creado.", book: newBook });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para actualizar un libro propio
exports.updateBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const {
            title,
            subtitle,
            bookType,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            isbn,
            interests,
            price,
            status,
            active,
        } = req.body;
        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });
        await book.update({
            title,
            subtitle,
            bookType,
            cover,
            openDate,
            deadlineChapters,
            publishDate,
            isbn,
            interests,
            price,
            status,
            active,
        });
        res.status(200).json({ message: "Libro actualizado.", book });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Función para eliminar un libro propio
exports.deleteBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: "Libro no encontrado." });
        await book.destroy();
        res.status(200).json({ message: "Libro eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.generateBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        /* 1️⃣  Recuperar libro y capítulos */
        const bookInstance = await Book.findByPk(bookId);
        if (!bookInstance) {
            return res.status(404).json({ message: "Libro no encontrado." });
        }
        const chaptersInstances = await Chapter.findAll({
            where: { bookId },
            order: [["createdAt", "ASC"]],
        });
        if (chaptersInstances.length === 0) {
            return res.status(400).json({ message: "El libro no tiene capítulos." });
        }

        /* 2️⃣  Preparar datos “plain” */
        const book = bookInstance.get({ plain: true });
        const chapters = chaptersInstances.map((ch) => ch.get({ plain: true }));

        /* 3️⃣  Generar PDF */
        const pdfName = `book_${bookId}.pdf`;
        ensureDir(publicDir);
        const pdfPath = path.join(publicDir, pdfName);

        const doc = new PDFKit({ size: "A4", margin: 50 });
        const fileStream = fs.createWriteStream(pdfPath);
        doc.pipe(fileStream);

        // Portada
        doc.fontSize(28).text(book.title, { align: "center" });
        if (book.subtitle) {
            doc.moveDown().fontSize(18).text(book.subtitle, { align: "center" });
        }
        doc.addPage();

        // Capítulos
        chapters.forEach((ch, i) => {
            doc.fontSize(18).text(`${i + 1}. ${ch.title}`, { underline: true });
            doc.moveDown().fontSize(12);

            doc.text(`Tipo de estudio: ${ch.studyType}`).moveDown(0.5);
            doc.text("Metodología").text(ch.methodology).moveDown();
            doc.text("Introducción").text(ch.introduction).moveDown();
            doc.text("Objetivos").text(ch.objectives).moveDown();
            doc.text("Resultados").text(ch.results).moveDown();
            doc.text("Discusión").text(ch.discussion).moveDown();
            doc.text("Bibliografía").text(ch.bibliography).moveDown();

            if (i < chapters.length - 1) doc.addPage();
        });

        doc.end();

        /* 4️⃣  Devolver la URL cuando el PDF esté escrito */
        fileStream.on("finish", () => {
            const host =
                process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
            const url = `${host}/generated/${pdfName}`;
            res.status(200).json({ url });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al generar el libro." });
    }
};

// POST /api/books/:bookId/cover
exports.uploadBookCover = async (req, res) => {
    try {
        const { bookId } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "Falta el fichero de portada." });
        }

        // 1️⃣ Construir la key para S3
        const key = `books/${bookId}/covers/${Date.now()}_${file.originalname}`;

        // 2️⃣ Subir el buffer directamente con PutObjectCommand y ACL public-read
        const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
        const s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            })
        );

        // 3️⃣ Construir la URL pública permanente (no caduca)
        const publicUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        // 4️⃣ Actualizar el campo `cover` del Book
        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({ message: "Libro no encontrado." });
        }
        await book.update({ cover: publicUrl });

        // 5️⃣ Devolver la URL pública al cliente
        res.status(200).json({ publicUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
