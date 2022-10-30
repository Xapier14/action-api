import { Router } from "express";

// modules
import {
  unauthorized,
  attachmentNotFound,
  internalFileReadError,
  attachmentDeleteSuccess,
} from "../../../modules/responseGenerator.js";

// models
import AttachmentSchema from "../../../models/attachment.js";

import { deleteAttachment } from "../../../modules/attachment.js";

const router = Router();

router.post("/", (req, res) => {
  unauthorized(res);
});

router.post("/:id", async (req, res) => {
  const id = req.params.id;
  const token = req.headers.authorization;

  // get attachment
  const attachment = await AttachmentSchema.findOne({ mediaId: id });
  if (attachment === null) {
    attachmentNotFound(res, id);
    return;
  }

  // delete file
  try {
    deleteAttachment(attachment.mediaId, attachment.mediaExtension);
  } catch (error) {
    internalFileReadError(res);
    return;
  }

  // delete from db
  await AttachmentSchema.deleteOne({ mediaId: id });
  attachmentDeleteSuccess(res, token);
});

export default router;
