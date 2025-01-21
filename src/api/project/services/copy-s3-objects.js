// Import the required classes from AWS SDK v3
const { S3Client, CopyObjectCommand } = require('@aws-sdk/client-s3');

// Use environment variables for authentication
const accessKeyId = process.env.AWS_S3_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const region = 'us-east-1'; // Set your AWS region

// Initialize the S3 client
const s3 = new S3Client({
  region, 
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Helper function to copy asset and generate new URL
async function copyAssetBetweenUsers(originalUrl, oldUserId, newUserId) {
  try {
    // Extract the key from the URL, removing query parameters
    const oldKey = extractKeyFromUrl(originalUrl, oldUserId);
    const newKey = generateNewKeyForUser(oldKey, newUserId);

    // Copy the object from the old location to the new location
    await s3.send(new CopyObjectCommand({
      Bucket: 'slidesdeck', // Your S3 bucket name
      CopySource: `slidesdeck/${oldKey.split('?')[0]}`, // Remove query parameters by splitting on '?'
      Key: `${newUserId}/image_list/${oldKey.split('/').pop()}` // Destination key for the new location
    }));

    // Return the new URL with the copied asset
    return `https://slidesdeck.s3.amazonaws.com/${newUserId}/image_list/${newKey.split('/').pop()}`;
  } catch (error) {
    console.error("Error copying asset: ", error);
    throw new Error("Failed to copy asset between users");
  }
}

// Function to extract the key from a URL (without query parameters)
function extractKeyFromUrl(url, userId) {
  return url.split('.com/')[1].split('?')[0]; // Extract the S3 key part and remove any query parameters
}


// Function to generate a new key for the new user
function generateNewKeyForUser(oldKey, newUserId) {
  const keyParts = oldKey.split('/');
  
  // Replace the old user ID with the new user ID in the key path
  keyParts[1] = newUserId;
  
  // Return the updated key for the new asset location
  return keyParts.join('/');
}

module.exports = {
  copyAssetBetweenUsers,
};
