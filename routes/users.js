// routes/users.js
const express = require("express");
const { getAllUsers, getUserProfile, createUser } = require("../controllers/userController");
const authenticate = require("../middlewares/authMiddleware");
const { getChapterCredits, getAvailableChapterCredits } = require("../controllers/chapterController");
const router = express.Router();

router.get("/", authenticate, getAllUsers);
router.get("/profile", authenticate, getUserProfile);
// Nueva ruta para crear un usuario (staff, por ejemplo)
router.post("/", authenticate, createUser);

router.get("/:userId/editions/:editionId/chapter-credits", getChapterCredits);
router.get("/:userId/editions/:editionId/available-credits", getAvailableChapterCredits);

module.exports = router;
