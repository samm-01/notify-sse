const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: "us-east-1",
    endpoint: process.env.S3_ENDPOINT, // MinIO URL
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    },
    forcePathStyle: true // Required for MinIO
});

module.exports = s3;
