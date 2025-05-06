const express = require("express");
const {
    getAllOwnChapters,
    getOneOwnChapter,
    createOwnChapter,
    updateOwnChapter,
    deleteOwnChapter,
    listChapterPurchases,
} = require("../controllers/ownChapterController");
const creditConsumptionController = require("../controllers/creditConsumptionController");
// Importamos los nuevos controladores
const {
    getChapterCredits,
    getAvailableChapterCredits,
} = require("../controllers/chapterController");

const router = express.Router();

router.get("/", getAllOwnChapters);
router.get("/:chapterId", getOneOwnChapter);
router.post("/", createOwnChapter);
router.put("/:chapterId", updateOwnChapter);
router.delete("/:chapterId", deleteOwnChapter);

// Historial de consumo de créditos
router.get(
    "/users/:userId/editions/:editionId/credit-consumption-history",
    creditConsumptionController.getCreditConsumptionHistory
);

// Listado de compras de créditos de capítulo
router.get("/chapter-purchases", listChapterPurchases);

// **Rutas añadidas**:
// Obtener créditos totales adquiridos por un usuario en una edición
router.get(
    "/users/:userId/editions/:editionId/chapter-credits",
    getChapterCredits
);

// Obtener créditos disponibles (totales comprados menos capítulos enviados)
router.get(
    "/users/:userId/editions/:editionId/available-chapter-credits",
    getAvailableChapterCredits
);

module.exports = router;
