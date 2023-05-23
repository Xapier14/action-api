/*
 * POST /delete/{:id}
 *   required parameters: id
 *   response:
 *    - 200: attachment delete successfull (e: 0)
 *    - 401: unauthorized (e: 7)
 *    - 404: attachment not found (e: 10)
 *    - 500: file read error (internal server error) (e: -2)
 */

// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  attachmentNotFound,
  internalFileReadError,
  attachmentDeleteSuccess,
} from "../../../modules/responseGenerator.js";
import { deleteAttachment } from "../../../modules/attachment.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";

// models
import AttachmentSchema from "../../../models/attachment.js";
import logging from "../../../modules/logging.js";

const router = Router();

router.post("/", (req, res) => {
  unauthorized(res);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const userId = await getUserIdFromToken(token);
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
    logging.log(
      req.ip,
      `Attachment deleted. (id: ${attachment.mediaId})`,
      token,
      "info",
      userId,
      "deleteAttachment"
    );
  } catch (error) {
    internalFileReadError(res);
    logging.log(
      req.ip,
      `Attachment delete failed. (id: ${attachment.mediaId})`,
      token,
      "error",
      userId,
      "deleteAttachment"
    );
    logging.err("Attachment.Delete", error);
    return;
  }

  // delete from db
  await AttachmentSchema.deleteOne({ mediaId: id });
  attachmentDeleteSuccess(res, token);
});

export default router;
