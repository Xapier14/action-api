import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

import create from "./reports/create.js";

const router = Router();
router.use(needsAuthentication);

router.use("/create", mustBeAccessLevel(0));
router.use("/create", create);

export default router;
