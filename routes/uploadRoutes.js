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
});

router.post("/uploads/cover", authenticate, async (req, res) => {
    const { filename, fileType } = req.body;
    const Key = `covers/${Date.now()}_${filename}`;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key,
        ContentType: fileType,
        ACL: "public-read",
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    // Devolver la key para construir la URL pública después
    res.json({ uploadUrl: url, key: Key });
});

module.exports = router;
