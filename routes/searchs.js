const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");



// 🔍 Búsqueda global
router.get("/", searchController.search);

module.exports = router;
