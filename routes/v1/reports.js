import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

import create from "./reports/create.js";
import fetch from "./reports/list.js";
import detail from "./reports/detail.js";
import indexFetch from "./reports/index-fetch.js";

const router = Router();
router.use(needsAuthentication);
router.use(mustBeAccessLevel(0));

router.use("/create", create);
router.use("/list", fetch);

router.use("/detail", mustBeAccessLevel(0));
router.use("/detail", detail);

router.use(indexFetch);

export default router;
