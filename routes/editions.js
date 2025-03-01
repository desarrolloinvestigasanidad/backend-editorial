const express = require("express");
const { createEdition, getEditions, getEdition, updateEdition, deleteEdition } = require("../controllers/editionController");
const router = express.Router();

router.post("/", createEdition);
router.get("/", getEditions);
router.get("/:id", getEdition);
router.put("/:id", updateEdition);
router.delete("/:id", deleteEdition);

module.exports = router;
