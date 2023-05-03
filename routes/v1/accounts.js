import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

import changePassword from "./accounts/changePassword.js";
import count from "./accounts/count.js";
import deletePost from "./accounts/delete.js";
import fetch from "./accounts/index-fetch.js";
import list from "./accounts/list.js";
import unlock from "./accounts/unlock.js";

const router = Router();
router.use(needsAuthentication);

router.use("/change-password", changePassword);
router.use("/count", mustBeAccessLevel(1));
router.use("/count", count);
router.use("/delete", mustBeAccessLevel(1));
router.use("/delete", deletePost);
router.use("/list", mustBeAccessLevel(1));
router.use("/list", list);
router.use("/unlock", mustBeAccessLevel(1));
router.use("/unlock", unlock);

router.use(fetch);

export default router;
