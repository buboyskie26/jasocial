import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

// const upload = multer({ storage, fileFilter });
// const uploadSingleImage = upload.single('image');

// router.post('/', (req, res) => {
//   //
//   uploadSingleImage(req, res, function (err) {

//     if (err) {
//       return res.status(400).send({ message: err.message });
//     }

//     console.log(req);

//     res.status(200).send({
//       message: 'Image uploaded successfully',
//       image: `/${req.file.path}`,
//     });

//   });
//   //
// });

const upload = multer({ storage, fileFilter });
const uploadMultipleImages = upload.array('images', 5); // 'images' should match the name attribute of the form field

// console.log(req);
// console.log(imagePaths);
// Now you can use imagePaths to update your database
// For example, assuming you have a Message model:
// const message = new Message({ images: imagePaths });
// await message.save();

router.post('/', (req, res) => {
  uploadMultipleImages(req, res, function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    const imagePaths = req.files.map((file) => `/${file.path}`);

    res.status(200).send({
      message: 'Images uploaded successfully',
      images: imagePaths,
    });
  });
});

export default router;
