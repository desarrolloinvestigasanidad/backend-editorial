// routes/users.js
const express = require("express");
const { getAllUsers, getUserProfile } = require("../controllers/userController");
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", authenticate, getAllUsers);
router.get("/profile", authenticate, getUserProfile);

module.exports = router;
