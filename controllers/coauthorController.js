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
