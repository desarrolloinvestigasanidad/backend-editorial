// routes/users.js
const express = require("express");
const {
    getAllUsers,
    getUserProfile,
    createUser,
    getUserById,
    searchUsers
} = require("../controllers/userController");
const authenticate = require("../middlewares/authMiddleware");
const {
    getChapterCredits,
    getAvailableChapterCredits,
    getChaptersForUser      // <— Importamos el nuevo controlador
} = require("../controllers/chapterController");

const router = express.Router();

router.get("/", authenticate, getAllUsers);
router.get("/profile", authenticate, getUserProfile);
// Nueva ruta para crear un usuario (staff, por ejemplo)
router.post("/", authenticate, createUser);

// Créditos de capítulo
router.get(
    "/:userId/editions/:editionId/chapter-credits",
    authenticate,
    getChapterCredits
);
router.get(
    "/:userId/editions/:editionId/available-credits",
    authenticate,
    getAvailableChapterCredits
);

// 📖 Nueva ruta: obtener capítulos de un usuario en una edición
router.get(
    "/:userId/chapters",
    authenticate,
    getChaptersForUser
);

router.get("/search", authenticate, searchUsers);
// Obtener un usuario por id
router.get("/:id", authenticate, getUserById);



module.exports = router;
