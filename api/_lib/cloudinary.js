const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(fileBase64, folder = 'catalogo') {
  const result = await cloudinary.uploader.upload(fileBase64, {
    folder,
    transformation: [
      { width: 600, height: 600, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
  return result.secure_url;
}

module.exports = { cloudinary, uploadImage };
