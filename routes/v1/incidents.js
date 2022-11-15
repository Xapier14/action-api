import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

import create from "./incidents/create.js";
import fetch from "./incidents/list.js";
import detail from "./incidents/detail.js";
import indexFetch from "./incidents/index-fetch.js";
import edit from "./incidents/edit.js";

const router = Router();
router.use(needsAuthentication);
router.use(mustBeAccessLevel(0));

router.use("/create", create);
router.use("/list", fetch);
router.use("/detail", detail);
router.use("/edit", mustBeAccessLevel(1));
router.use("/edit", edit);

router.use(indexFetch);

export default router;
