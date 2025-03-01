const express = require("express");
const { createRole, getRoles } = require("../controllers/roleController");
const router = express.Router();

router.post("/", createRole);
router.get("/", getRoles);

module.exports = router;
