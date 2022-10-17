import { Router } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

import { uploadSingle } from "../../../middlewares/upload.js";
import {
  attachmentUploadSuccess,
  databaseError,
} from "../../../modules/responseGenerator.js";
import { checkMimeType } from "../../../modules/typeCheck.js";

import AttachmentSchema from "../../../models/attachment.js";
import UserSchema from "../../../models/user.js";

const router = Router();

router.post("/", uploadSingle("file"), (req, res) => {
  const token = req.headers.authorization;

  // get user from token
  UserSchema.findOne({ token: token }, (err, user) => {
    if (err) {
      databaseError(req, res, err);
      return;
    }
    const userId = user.id;
    const file = req.file;

    // prepare file metadata
    const extension = file.originalname.split(".").pop();
    const type = checkMimeType(file.mimetype);
    const id = uuidv4();
    const localPath = path.join("attachments/" + id + "." + extension);

    // copy to attachments folder
    const readStream = fs.createReadStream(file.path);
    const writeStream = fs.createWriteStream(localPath);
    readStream.pipe(writeStream);

    // create attachment object in database
    AttachmentSchema.create(
      {
        uploader: userId,
        mediaId: id,
        mediaType: type,
        mediaExtension: extension,
      },
      (err, _) => {
        if (err) {
          databaseError(req, res, err);
          console.log(err);
          return;
        }
        attachmentUploadSuccess(res, token, id);
      }
    );
  });
});

export default router;
