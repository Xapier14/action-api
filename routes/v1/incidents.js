import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

import create from "./incidents/create.js";
import list from "./incidents/index-list.js";
import fetch from "./incidents/index-fetch.js";
import edit from "./incidents/edit.js";
import detail from "./incidents/detail.js";

const router = Router();
router.use(needsAuthentication);
router.use(mustBeAccessLevel(0));

router.use("", list);
router.use("", fetch);

router.use("/edit", edit);
router.use("/create", create);
router.use("/detail", detail);

export default router;
