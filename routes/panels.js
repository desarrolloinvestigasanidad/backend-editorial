const express = require("express");
const { getMyPublications, getLibrary } = require("../controllers/panelController");
const router = express.Router();

router.get("/publications/:userId", getMyPublications);
router.get("/library", getLibrary);

module.exports = router;
