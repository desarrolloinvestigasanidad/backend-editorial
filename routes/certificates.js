const express = require("express");
const { generateCertificate, getCertificatesByUser } = require("../controllers/certificateController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, generateCertificate);
router.get("/user/:userId", authMiddleware, getCertificatesByUser);

module.exports = router;
