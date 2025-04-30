// routes/checkout.js
const express = require("express");
const router = express.Router();
const {
    createCheckoutSession,
    getCheckoutSession,
} = require("../controllers/checkoutController");

// POST /api/checkout  → crea la sesión
router.post("/", createCheckoutSession);

// GET  /api/checkout  → recupera la sesión
router.get("/", getCheckoutSession);

module.exports = router;
