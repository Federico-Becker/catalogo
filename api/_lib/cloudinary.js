const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(fileBase64, folder = 'catalogo') {
  const hash = crypto.createHash('md5').update(fileBase64).digest('hex');
  const result = await cloudinary.uploader.upload(fileBase64, {
    folder,
    public_id: hash,
    unique_filename: false,
    overwrite: false,
    transformation: [
      { width: 600, height: 600, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
  return result.secure_url;
}

module.exports = { cloudinary, uploadImage };
