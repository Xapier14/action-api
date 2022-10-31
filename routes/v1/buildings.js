import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

import add from "./buildings/add.js";
import list from "./buildings/list.js";

const router = Router();
router.use(needsAuthentication);

router.use("/add", mustBeAccessLevel(1));
router.use("/add", add);

router.use("/list", list);

export default router;
