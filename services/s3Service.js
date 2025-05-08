const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET;

const s3 = new S3Client({ region: REGION, forcePathStyle: false });

// ————————————————
// Función genérica para subir cualquier buffer
// ————————————————
async function uploadFile(buffer, key, contentType) {
    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,

    }));
    return key;
}

async function uploadPDF(body, fileName, contentType) {
    const key = `books/${Date.now()}_${fileName}`;
    await uploadFile(body, key, contentType);
    return key;
}

async function getPDFUrl(key, expiresIn = 3600) {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3, cmd, { expiresIn });
}

/**
 * Descarga un objeto de S3 y lo devuelve como Buffer.
 * @param {string} key La key del objeto dentro del bucket.
 * @returns {Promise<Buffer>}
 */
async function downloadFile(key) {
    const resp = await s3.send(new GetObjectCommand({
        Bucket: BUCKET,
        Key: key
    }));
    return new Promise((resolve, reject) => {
        const chunks = [];
        resp.Body.on("data", (chunk) => chunks.push(chunk));
        resp.Body.on("end", () => resolve(Buffer.concat(chunks)));
        resp.Body.on("error", reject);
    });
}

module.exports = {
    uploadPDF,
    getPDFUrl,
    uploadFile,
    downloadFile
};
