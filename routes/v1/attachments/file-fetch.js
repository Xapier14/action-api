/*
 * GET /{:file}
 *   required parameters: file
 *   required fields: a (timedAccessToken)
 *   response:
 *    - 404: file not found (e: 10)
 */

// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  fileNotFound,
} from "../../../modules/responseGenerator.js";
import {
  fetchAttachment,
  isUsingAzureStorage,
} from "../../../modules/attachment.js";

// models
import TimedAccessTokenSchema from "../../../models/timedAccessToken.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  const timedAccessToken = req.query.a ?? req.query.access ?? req.query.token;

  const taToken = await TimedAccessTokenSchema.findOne({
    file: fileName,
    token: timedAccessToken,
  });
  if (taToken === null) {
    fileNotFound(res);
    return;
  }
  const data = await fetchAttachment(fileName);
  if (data === null) {
    fileNotFound(res);
    return;
  }
  res.setHeader("Content-Type", taToken.contentType);
  if (!isUsingAzureStorage()) {
    res.write(data);
  } else {
    // redirect
    res.redirect(data);
  }
  res.end();
});

export default router;
