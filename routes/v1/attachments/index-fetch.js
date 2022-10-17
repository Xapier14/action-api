import { Router } from "express";
import fs from "fs";

// middlewares
import { fields } from "../../../middlewares/required.js";

// modules
import {
  unauthorized,
  attachmentNotFound,
} from "../../../modules/responseGenerator.js";

// models
import AttachmentSchema from "../../../models/attachment.js";
import { getBase64FromAttachmentId } from "../../../modules/attachment.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const token = req.headers.authorization;
  // get attachment
  AttachmentSchema.findOne({ mediaId: id }, (err, attachment) => {
    if (err || attachment === null) {
      attachmentNotFound(res);
      return;
    }
    const filePath = "attachments/" + id + "." + attachment.mediaExtension;
    if (!fs.existsSync(filePath)) {
      attachmentNotFound(res);
    } else {
      // open file
      const file = fs.readFileSync(filePath);
      // send to res
      res.write(file);
      res.end();
    }
  });
});

export default router;
