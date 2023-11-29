import { Router } from "express";
import needsAuthentication from "../../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../../middlewares/authorization.js";

import add from "./inventory/add.js";
import $delete from "./inventory/delete.js";
import list from "./inventory/list.js";
import edit from "./inventory/edit.js";

const router = Router();

router.use(needsAuthentication);
router.use(mustBeAccessLevel(1));

router.use("/add", add);
router.use("/delete", $delete);
router.use("/list", list);
router.use("/edit", edit);

export default router;
