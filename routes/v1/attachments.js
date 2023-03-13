import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

import upload from "./attachments/upload.js";
import deletePost from "./attachments/delete.js";
import fromFetch from "./attachments/from-fetch.js";
import indexFetch from "./attachments/index-fetch.js";
import fileFetch from "./attachments/file-fetch.js";

const router = Router();
router.use("/upload", needsAuthentication);
router.use("/upload", mustBeAccessLevel(0));
router.use("/upload", upload);

router.use("/delete", needsAuthentication);
router.use("/delete", mustBeAccessLevel(1));
router.use("/delete", deletePost);

router.use("/from", needsAuthentication);
router.use("/from", mustBeAccessLevel(0));
router.use("/from", fromFetch);

router.use("/file", fileFetch);

router.use(indexFetch);

export default router;
