import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

import upload from "./attachments/upload.js";
import indexFetch from "./attachments/index-fetch.js";

const router = Router();
router.use(needsAuthentication);

router.use("/upload", mustBeAccessLevel(0));
router.use("/upload", upload);
router.use(indexFetch);

export default router;
