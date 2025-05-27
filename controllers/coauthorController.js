const User = require("../models/User");

exports.addCoauthor = async (req, res) => {
    try {
        const { identifier, bookId } = req.body; // 'identifier' es DNI/NIE/Pasaporte y 'bookId' es el libro al que se asociará (opcional)
        const coauthor = await User.findOne({ where: { id: identifier } });
        if (!coauthor) {
            return res.status(404).json({ message: "Coautor no encontrado." });
        }
        // Aquí se implementaría la lógica para asociar el coautor a un libro o capítulo.
        // Por ejemplo, si tienes definida una relación Many-to-Many entre Book y User como coautores, podrías hacer algo como:
        // const book = await Book.findByPk(bookId);
        // if (!book) return res.status(404).json({ message: "Libro no encontrado." });
        // await book.addCoauthor(coauthor);

        res.status(200).json({ message: "Coautor agregado.", coauthor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.removeCoauthor = async (req, res) => {
    try {
        const { userId, bookId, chapterId } = req.body
        const currentUserId = req.user.id // Asumiendo que tienes middleware de autenticación

        // Verificar que no se está intentando eliminar al autor principal
        if (userId === currentUserId) {
            return res.status(400).json({
                message: "No puedes eliminarte a ti mismo como autor principal.",
            })
        }

        const coauthor = await User.findOne({ where: { id: userId } })
        if (!coauthor) {
            return res.status(404).json({ message: "Coautor no encontrado." })
        }

        // Lógica para remover el coautor del libro o capítulo
        if (chapterId) {
            // Remover del capítulo
            // const chapter = await Chapter.findByPk(chapterId);
            // if (!chapter) return res.status(404).json({ message: "Capítulo no encontrado." });
            // await chapter.removeCoauthor(coauthor);
        } else if (bookId) {
            // Remover del libro
            // const book = await Book.findByPk(bookId);
            // if (!book) return res.status(404).json({ message: "Libro no encontrado." });
            // await book.removeCoauthor(coauthor);
        }

        res.status(200).json({
            message: "Coautor eliminado exitosamente.",
            removedCoauthor: {
                id: coauthor.id,
                name: `${coauthor.firstName} ${coauthor.lastName}`,
                email: coauthor.email,
            },
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}