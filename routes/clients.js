const express = require("express");
const { getAllClients, getClientById, updateClientById, deleteClientById, getClientPayments, getClientPublications, impersonateClient, changeUserPassword } = require("../controllers/clientController");
const authenticate = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const router = express.Router();

// Ruta para obtener todos los clientes
router.get("/", authenticate, getAllClients);
router.get("/:id", authenticate, getClientById);
router.put("/:id", authenticate, updateClientById);
router.delete("/:id", authenticate, deleteClientById);
router.get("/:id/payments", authenticate, getClientPayments);
router.get("/:id/publications", authenticate, getClientPublications);
router.get("/:id/impersonate", authenticate, impersonateClient);
router.put(
    "/:id/password",
    authenticate,
    isAdmin,
    changeUserPassword
);

module.exports = router;
