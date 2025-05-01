// services/s3Service.js
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REGION = process.env.AWS_REGION;    // ahora us-east-1
const BUCKET = process.env.S3_BUCKET;

const s3 = new S3Client({
    region: REGION,
    forcePathStyle: false    // virtual-hosted-style
});

async function uploadPDF(body, fileName, contentType) {
    const key = `books/${Date.now()}_${fileName}`;
    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: "private"
    }));
    return key;
}

async function getPDFUrl(key, expiresIn = 3600) {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3, cmd, { expiresIn });
}

module.exports = { uploadPDF, getPDFUrl };
