const express = require("express");
const { generateCertificate, getCertificatesByUser } = require("../controllers/certificateController");
const router = express.Router();

router.post("/", generateCertificate);
router.get("/user/:userId", getCertificatesByUser);

module.exports = router;
