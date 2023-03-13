/*
 * GET /{:attachmentId}
 *   required parameters: attachmentId
 *   response:
 *    - 401: unauthorized (e: 7)
 *    - 404: attachment not found (e: 10)
 */

// packages
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

// modules
import {
  unauthorized,
  attachmentNotFound,
  attachmentFound,
} from "../../../modules/responseGenerator.js";
// import {
//   fetchAttachment,
//   isUsingAzureStorage,
// } from "../../../modules/attachment.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";

// models
import AttachmentSchema from "../../../models/attachment.js";
import TimedAccessTokenSchema from "../../../models/timedAccessToken.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const token = req.headers.authorization;

  const userId = await getUserIdFromToken(token);
  if (userId === null) {
    unauthorized(res);
    return;
  }

  // get attachment
  const attachment = await AttachmentSchema.findOne({ mediaId: id });
  if (attachment === null) {
    attachmentNotFound(res);
    return;
  }

  const fileName = id + "." + attachment.mediaExtension;
  const contentType = attachment.mediaType + "/" + attachment.mediaExtension;

  var taToken = await TimedAccessTokenSchema.findOne({
    file: fileName,
    createdByUserId: userId,
  });
  if (taToken === null) {
    taToken = await TimedAccessTokenSchema.create({
      file: fileName,
      token: uuidv4(),
      createdByUserId: userId,
      contentType: contentType,
    });
  }

  const urlParams = new URLSearchParams({
    a: taToken.token,
  });

  const url =
    process.env.BASE_URL +
    "/api/v1/attachments/file/" +
    fileName +
    "?" +
    urlParams.toString();

  const expiresAt = new Date(taToken.createdAt);
  expiresAt.setHours(expiresAt.getHours() + 4);
  attachmentFound(res, url, expiresAt);
  // const data = await fetchAttachment(id, attachment.mediaExtension);
  // if (data === null) {
  //   attachmentNotFound(res);
  //   return;
  // }
  // // send data
  // const contentType = attachment.mediaType + "/" + attachment.mediaExtension;
  // res.setHeader("Content-Type", contentType);
  // console.log("content-type: " + contentType);
  // if (!isUsingAzureStorage()) {
  //   res.write(data);
  // } else {
  //   // redirect
  //   res.redirect(data);
  // }
  // res.end();
});

export default router;
