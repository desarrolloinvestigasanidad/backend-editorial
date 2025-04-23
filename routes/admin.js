const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const adminCtrl = require("../controllers/adminController");

router.post("/impersonate/:userId",
    authMiddleware,
    isAdmin,
    adminCtrl.impersonateUser
);

module.exports = router;
