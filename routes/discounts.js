const express = require("express");
const { createDiscount, getDiscounts, updateDiscount } = require("../controllers/discountController");
const router = express.Router();

router.post("/", createDiscount);
router.get("/", getDiscounts);
router.put("/:id", updateDiscount);

module.exports = router;
