// routes/chapters.js
const express = require("express");
const {
    getAllOwnChapters,
    getOneOwnChapter,
    createOwnChapter,
    updateOwnChapter,
    deleteOwnChapter,
} = require("../controllers/ownChapterController");

const router = express.Router();

router.get("/", getAllOwnChapters);
router.get("/:chapterId", getOneOwnChapter);
router.post("/", createOwnChapter);
router.put("/:chapterId", updateOwnChapter);
router.delete("/:chapterId", deleteOwnChapter);

module.exports = router;
