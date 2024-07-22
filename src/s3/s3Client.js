import { S3Client } from "@aws-sdk/client-s3";
// Установка региона Object Storage
const REGION = "ru-central1";
// Установка эндпоинта Object Storage
const ENDPOINT = "https://storage.yandexcloud.kz";
// Создание клиента для Object Storage
const s3Client = new S3Client({
    region: REGION, endpoint: ENDPOINT, credentials: {
        accessKeyId: 'YCB2BzjHd8epgNyLs6eDfFnW4',
        secretAccessKey: 'YCMVWV1P3UxcIG-YJEcCVyq74jw49_-23UP6UQdT'
    }
});
export { s3Client };