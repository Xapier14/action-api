/*
 * Upload - Express.js middleware
 * Lance Crisang - 2022
 *
 * Provides middleware for uploading files.
 *
 * Requires 'responseGenerator.js' and 'typeCheck.js'
 */

const STORAGE_PATH = "./localUploadCache/";

import multer from "multer";
import { invalidFileUpload } from "../modules/responseGenerator.js";
import { getAllAllowedMimeTypes } from "../modules/typeCheck.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, STORAGE_PATH);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = getAllAllowedMimeTypes();
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

function perFileHandler(file) {
  console.log(file);
  // this function is called for each file upload
  if (file == null) {
    console.error("file is null");
    return true;
  }

  // handle file here, e.g.:
  // store into a remote database from local cache
}

export function uploadSingle(field) {
  var middleware = upload.single(field);
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err || perFileHandler(req.file)) {
        console.error("upload middleware error");
        console.error(err);
        invalidFileUpload(res);
        return;
      }
      next();
    });
  };
}
