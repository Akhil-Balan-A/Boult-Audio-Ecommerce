const multer = require('multer');
const path = require('path');
const fs = require('fs');


//ensure the target directory exists, if not make one.
const targetDir = path.resolve('public', 'uploads', 'product-images');

if(!fs.existsSync(targetDir)){
    fs.mkdirSync(targetDir,{recursive:true})
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/Admin/uploads/product-images/'); // Destination folder for images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept image files
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({storage:fileFilter})

module.exports = multer({ storage, fileFilter });
