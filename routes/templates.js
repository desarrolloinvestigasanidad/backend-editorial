const express = require("express");
const { createTemplate, getTemplates } = require("../controllers/templateController");
const router = express.Router();

router.post("/", createTemplate);
router.get("/", getTemplates);

module.exports = router;
