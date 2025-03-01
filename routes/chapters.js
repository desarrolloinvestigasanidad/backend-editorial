const express = require("express");
const { createChapter, reviewChapter } = require("../controllers/chapterController");
const router = express.Router();

router.post("/", createChapter);
router.patch("/:id/status", reviewChapter);

module.exports = router;
