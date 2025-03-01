const express = require("express");
const { createDiscount, getDiscounts } = require("../controllers/discountController");
const router = express.Router();

router.post("/", createDiscount);
router.get("/", getDiscounts);

module.exports = router;
