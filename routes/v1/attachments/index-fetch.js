/*
 * GET /{:attachmentId}
 *   required parameters: attachmentId
 *   response:
 *    - 401: unauthorized (e: 7)
 *    - 404: attachment not found (e: 10)
 */

// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  attachmentNotFound,
} from "../../../modules/responseGenerator.js";
import {
  fetchAttachment,
  isUsingAzureStorage,
} from "../../../modules/attachment.js";

// models
import AttachmentSchema from "../../../models/attachment.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  // get attachment
  const attachment = await AttachmentSchema.findOne({ mediaId: id });
  if (attachment === null) {
    attachmentNotFound(res);
    return;
  }

  const data = await fetchAttachment(id, attachment.mediaExtension);
  if (data === null) {
    attachmentNotFound(res);
    return;
  }
  // send data
  const contentType = attachment.mediaType + "/" + attachment.mediaExtension;
  res.setHeader("Content-Type", contentType);
  console.log("content-type: " + contentType);
  if (!isUsingAzureStorage()) {
    res.write(data);
  } else {
    // redirect
    res.redirect(data);
  }
  res.end();
});

export default router;
