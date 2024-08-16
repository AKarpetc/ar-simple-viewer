import { S3Client } from "@aws-sdk/client-s3";
import conf from "../../src/config/config.js"

// Установка региона Object Storage
const REGION = conf.awsRegion;
// Установка эндпоинта Object Storage
const ENDPOINT = conf.awsEndPoint;
// Создание клиента для Object Storage
const s3Client = new S3Client({
    region: REGION, endpoint: ENDPOINT, credentials: {
        accessKeyId: conf.awsAccessKeyId,
        secretAccessKey: conf.awsSecretAccessKey
    }
});
export { s3Client };