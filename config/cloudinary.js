    const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'zebader',
  api_key: '556321387172978',
  api_secret: 'wZnXyVPSU0pcDJbtebmBURPtANM'
});

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'project_module03',
  allowedFormats: ['jpg', 'png'],
  filename: function (req, file, cb) {
    cb(null, 'my-file-name');
  }
});

const parser = multer({ storage: storage });

module.exports = parser;