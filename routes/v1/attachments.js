import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

import upload from "./attachments/upload.js";
import deletePost from "./attachments/delete.js";
import fromFetch from "./attachments/from-fetch.js";
import indexFetch from "./attachments/index-fetch.js";

const router = Router();
router.use(needsAuthentication);

router.use("/upload", mustBeAccessLevel(0));
router.use("/upload", upload);

router.use("/delete", mustBeAccessLevel(1));
router.use("/delete", deletePost);

router.use("/from", mustBeAccessLevel(0));
router.use("/from", fromFetch);

router.use(indexFetch);

export default router;
