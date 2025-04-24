const express = require("express");
const { createPayment, getPayments, getPaymentById } = require("../controllers/paymentController");
const router = express.Router();

router.post("/", createPayment);
router.get("/:id", getPaymentById);
router.get("/", getPayments);

module.exports = router;
