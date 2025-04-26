// backend-editorial/services/s3Service.js
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });

// 5. Subida de PDF grandes (multipart)
export async function uploadPDF(fileStream, fileName, contentType) {
    const key = `books/${Date.now()}_${fileName}`;
    const upload = new Upload({
        client: s3,
        params: {
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: fileStream,
            ContentType: contentType,
            ACL: "private"
        }
    });

    upload.on("httpUploadProgress", ({ loaded, total }) => {
        console.log(`Subido ${loaded}/${total}`);
    });

    await upload.done();
    return key; // devuelve la key para guardar en la base de datos
}

// 6. Generar presigned URLs (para servir PDFs privados)
export async function getPDFUrl(key, expiresIn = 3600) {
    const cmd = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key
    });
    return getSignedUrl(s3, cmd, { expiresIn });
}
