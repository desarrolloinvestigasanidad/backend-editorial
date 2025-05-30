// models/Certificate.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
// No es necesario importar Book y Chapter aquí directamente para la definición del modelo en sí,
// pero sí para el método 'associate'.

const Certificate = sequelize.define("Certificate", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: { type: DataTypes.STRING, allowNull: false }, // Asumo que referencia a la tabla Users y su PK es STRING
    bookId: { // <--- AÑADIR ESTO
        type: DataTypes.UUID, // Debe coincidir con el tipo de Book.id
        allowNull: false,     // Un certificado siempre debe estar asociado a un libro
        references: {
            model: 'books',   // Nombre de la tabla 'books'
            key: 'id',
        }
    },
    chapterId: { // <--- AÑADIR ESTO
        type: DataTypes.UUID, // Debe coincidir con el tipo de Chapter.id
        allowNull: true,      // Un certificado puede no estar asociado a un capítulo (e.g., certificado de libro)
        references: {
            model: 'chapters', // Nombre de la tabla 'chapters'
            key: 'id',
        }
    },
    type: { type: DataTypes.STRING, allowNull: false }, // "chapter_author", "book_author"
    content: { type: DataTypes.TEXT, allowNull: false }, // JSON string
    documentUrl: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: "generated" },
    // issuedAt: { type: DataTypes.DATE }, // Ya tienes timestamps: true, así que createdAt podría ser tu issuedAt
}, {
    timestamps: true,
    tableName: "certificates", // Especificar explícitamente el nombre de la tabla
});

// Método para definir asociaciones
Certificate.associate = (models) => {
    Certificate.belongsTo(models.User, { // Asumo que 'models.User' es como accedes al modelo User
        foreignKey: 'userId',
        as: 'user' // Alias para la asociación con User
    });
    Certificate.belongsTo(models.Book, { // Asumo que 'models.Book' es como accedes al modelo Book
        foreignKey: 'bookId',
        as: 'book' // ESTE ALIAS 'book' ES CRUCIAL y debe coincidir con el `include`
    });
    Certificate.belongsTo(models.Chapter, { // Asumo que 'models.Chapter' es como accedes al modelo Chapter
        foreignKey: 'chapterId',
        as: 'chapter', // ESTE ALIAS 'chapter' ES CRUCIAL
        allowNull: true, // Es importante si la FK puede ser nula
        required: false
    });
};

module.exports = Certificate;