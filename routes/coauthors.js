const express = require("express");
const { addCoauthor } = require("../controllers/coauthorController");
const router = express.Router();

router.post("/", addCoauthor);

module.exports = router;
