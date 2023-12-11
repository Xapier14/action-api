/*
 * upload.js - Express.js middleware
 *
 * Provides middleware for uploading files.
 *
 * Requires 'responseGenerator.js' and 'typeCheck.js'
 *
 * Copyright © 2023 Lance Crisang (Xapier14)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
