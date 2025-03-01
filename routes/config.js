const express = require("express");
const { getSetting, updateSetting } = require("../controllers/configController");
const router = express.Router();

router.get("/:key", getSetting);
router.put("/:key", updateSetting);

module.exports = router;
