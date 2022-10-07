import { Router } from "express";

// middlewares
import { fields } from "../../../middlewares/required.js";

// modules
import {
  unauthorized,
  attachmentFetchSuccess,
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
  AttachmentSchema.findOne({ id: id }, (err, _) => {
    if (err) {
      unauthorized(res);
      return;
    }
    const base64 = getBase64FromAttachmentId(id);
    if (base64 == null) {
      unauthorized(res);
      return;
    }
    attachmentFetchSuccess(res, token, base64);
  });
});

export default router;
