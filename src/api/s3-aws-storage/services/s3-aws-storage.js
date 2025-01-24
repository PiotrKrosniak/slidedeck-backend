const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const accessKeyId = process.env.AWS_S3_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const region = 'us-east-1'; // Set your AWS region

class S3AWSStorageService {
  constructor() {
    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async handleAudioUpload(fileName, params) {
    try {
      const uploadCommand = new PutObjectCommand({
        Bucket: params.Bucket,
        Key: fileName,
        Body: params.Body,
        ContentType: params.ContentType
      });

      await this.s3.send(uploadCommand);

      // Generate a signed URL using getSignedUrl
      const getObjectCommand = new GetObjectCommand({
        Bucket: params.Bucket,
        Key: fileName
      });

      // @ts-ignore
      const audioURL = await getSignedUrl(this.s3, getObjectCommand, { expiresIn: 100000 });

      return audioURL;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  }
}

module.exports = new S3AWSStorageService();