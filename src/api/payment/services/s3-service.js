// Import the required classes from AWS SDK v3
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Use environment variables for authentication
const accessKeyId = process.env.AWS_S3_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const region = 'us-east-1'; // You may need to set the AWS region

// Initialize the S3 client
const s3 = new S3Client({
  region, // Specify your AWS region
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const getUserStorageUsage = async (userUuid) => {
  const bucketName = 'slidesdeck'; // Replace with your S3 bucket name
  const folderPath = `${userUuid}/`; // Use user_uuid to identify the folder

  const params = {
    Bucket: bucketName,
    Prefix: folderPath, // Set the folder path as the prefix to list objects under this folder
  };

  let totalSize = 0;

  try {
    // Create and send the command to list objects
    const data = await s3.send(new ListObjectsV2Command(params));

    if (data.Contents) {
      data.Contents.forEach((file) => {
        totalSize += file.Size; // Sum the size of each file in bytes
      });
    }

    // Return the total size of the folder in bytes
    return totalSize;
  } catch (error) {
    console.error('Error fetching storage data from S3:', error);
    return 0; // Return 0 if there's an error fetching data
  }
};

module.exports = {
  getUserStorageUsage,
};
