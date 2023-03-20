/*
 * POST
 *   required parameters: file = multipart/file
 *   response:
 *    - 200: attachment upload successfull (e: 0)
 *    - 500: database error (e: -1)
 */

// packages
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

// middlewares
import { uploadSingle } from "../../../middlewares/upload.js";

// modules
import {
  attachmentUploadSuccess,
  databaseError,
} from "../../../modules/responseGenerator.js";
import { checkMimeType } from "../../../modules/typeCheck.js";
import { saveAttachment } from "../../../modules/attachment.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";
import { generateThumbnail } from "../../../modules/ffmpeg.js";

// models
import AttachmentSchema from "../../../models/attachment.js";
import UserSchema from "../../../models/user.js";

const router = Router();

router.post("/", uploadSingle("file"), async (req, res) => {
  const token = req.headers.authorization;

  // get user from token
  const userId = await getUserIdFromToken(token);

  const file = req.file;

  // prepare file metadata
  const extension = file.originalname.split(".").pop();
  const type = checkMimeType(file.mimetype);
  const id = uuidv4();

  // save file
  await saveAttachment(id, file.mimetype, extension, file.path);

  // create attachment object in database
  const attachment = await AttachmentSchema.create({
    uploader: userId,
    mediaId: id,
    mediaType: type,
    mediaExtension: extension,
  });
  // create attachment object in database
  const attachmentThumb = await AttachmentSchema.create({
    uploader: userId,
    mediaId: id + "-thumb",
    mediaType: "image",
    mediaExtension: "png",
  });
  if (attachment === null) {
    databaseError(req, res, err);
    console.log(err);
    return;
  }
  attachmentUploadSuccess(res, token, id);
});

export default router;
