const Setting = require("../models/Setting");

exports.getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await Setting.findByPk(key);
        if (!setting) return res.status(404).json({ message: "Configuración no encontrada." });
        res.status(200).json(setting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        let setting = await Setting.findByPk(key);
        if (setting) {
            setting = await setting.update({ value });
        } else {
            setting = await Setting.create({ key, value });
        }
        res.status(200).json({ message: "Configuración actualizada.", setting });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
