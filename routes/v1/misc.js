import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";

import resolve from "./misc/resolve.js";

const router = Router();
router.use(needsAuthentication);
router.use("/resolve", resolve);

export default router;
