import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";

import resolve from "./misc/resolve.js";
import reports from "./misc/reports.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

const router = Router();
router.use(needsAuthentication);
router.use("/resolve", resolve);
router.use("/reports", mustBeAccessLevel(1));
router.use("/reports", reports);

export default router;
