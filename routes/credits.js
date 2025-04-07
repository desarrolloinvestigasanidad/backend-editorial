// routes/credits.js
router.get('/users/:userId/credit-history', async (req, res) => {
    const { userId } = req.params;
    try {
        const history = await CreditHistory.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });
        res.json(history);
    } catch (error) {
        console.error('Error obteniendo historial de créditos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
