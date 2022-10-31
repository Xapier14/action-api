// packages
import { Router } from "express";
import fs from "fs";
import util from "util";

// modules
import {
  unauthorized,
  attachmentNotFound,
  internalFileReadError,
} from "../../../modules/responseGenerator.js";

// models
import AttachmentSchema from "../../../models/attachment.js";

const router = Router();
const readFile = util.promisify(fs.readFile);

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const token = req.headers.authorization;
  // get attachment
  const attachment = await AttachmentSchema.findOne({ mediaId: id });
  if (attachment === null) {
    attachmentNotFound(res);
    return;
  }
  const filePath = "attachments/" + id + "." + attachment.mediaExtension;
  if (!fs.existsSync(filePath)) {
    attachmentNotFound(res);
  } else {
    // open file
    const file = await readFile(filePath);
    if (file === null) {
      internalFileReadError(req, res, err);
      return;
    }
    // send file
    res.write(file);
    res.end();
  }
});

export default router;
