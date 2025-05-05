'use strict';

const { S3Client, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

module.exports = {
  async upload(ctx) {

    try {

      const { key, contentType } = ctx.request.body;
      const file = ctx.request.files?.file;

      if(!file) ctx.throw(400, 'No file provided')
     const fileStream = fs.createReadStream(file.path);
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: fileStream,
          ContentType: contentType
        }
      });

      const result = await upload.done();
      return { success: true, data: result };
    } catch (error) {
  console.error('Error uploading file to S3:', error);

      ctx.throw(500, error);
    }
  },

  async delete(ctx) {
    try {
      const { key } = ctx.request.body;
      
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      });

      await s3Client.send(command);
      return { success: true };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async list(ctx) {
    try {
      const { prefix } = ctx.query;
      console.log('S3 List Query:', ctx.query);
      
      const command = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: prefix || ''
      });

      const result = await s3Client.send(command);
      return { 
        success: true, 
        data: {
          Contents: result.Contents || []
        }
      };

    } catch (error) {
      console.error('S3 List Error:', error);
      ctx.throw(500, error);
    }
  },

  async getSignedUrl(ctx) {
    try {
      const { key, expires = 3600 } = ctx.query;
      console.log('S3 Get Signed URL Query:', ctx.query);
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      });

      const url = await getSignedUrl(s3Client, command, { 
        expiresIn: parseInt(expires),
        signableHeaders: new Set(['host']),
        unsignableHeaders: new Set(['x-amz-checksum-mode', 'x-id']),
        signingDate: new Date()
      });
    
      return { success: true, url };
    } catch (error) {
      console.error('S3 Get Signed URL Error:', error);
      ctx.throw(500, error);
    }
  }
}; 
