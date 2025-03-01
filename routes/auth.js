const express = require("express");
const { register, verifyEmail, login, updateProfile, handlePasswordReset, getProfile } = require("../controllers/authController");
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.put("/update-profile", authenticate, updateProfile);
router.post("/password-reset", handlePasswordReset);
router.get("/profile", authenticate, getProfile);

module.exports = router;
