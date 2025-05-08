const express = require("express");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: false,
});

router.post("/uploads/cover", authenticate, async (req, res) => {
    const { filename, fileType } = req.body;
    const Key = `covers/${Date.now()}_${filename}`;

    // 1️⃣ Preparar comando PUT con ACL pública
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key,
        ContentType: fileType,

    });

    // 2️⃣ Generar URL pre-firmada para subir (caduca en 1 hora)
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // 3️⃣ Construir URL pública permanente (no caduca)
    const publicUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;

    // 4️⃣ Devolver al cliente ambas URLs y la key
    res.json({ uploadUrl, key: Key, publicUrl });
});

module.exports = router;
