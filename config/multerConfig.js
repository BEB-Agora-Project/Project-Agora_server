require("dotenv").config();
const env = process.env;

const multerConfig = {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
    region: env.S3_REGION,
    bucketName: env.S3_BUCKET_NAME
};


module.exports = {awsConfig: multerConfig};