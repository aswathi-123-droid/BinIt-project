
import multer from "multer";
import os from "os";

const imageFileFilter = (req, file, cb) => {

  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type: Only image files (JPG, PNG, WEBP, etc.) are allowed!"), false);
  }
};


export const uploadImageMiddleware = multer({
  dest: os.tmpdir(),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});
