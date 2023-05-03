import { Router } from "express";
import needsAuthentication from "../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

import add from "./buildings/add.js";
import edit from "./buildings/edit.js";
import list from "./buildings/list.js";
import deleteId from "./buildings/delete.js";
import fetch from "./buildings/index-fetch.js";

const router = Router();
router.use(needsAuthentication);

router.use("/add", mustBeAccessLevel(1));
router.use("/add", add);
router.use("/edit", mustBeAccessLevel(1));
router.use("/edit", edit);
router.use("/delete", mustBeAccessLevel(1));
router.use("/delete", deleteId);

router.use("/list", list);
router.use(fetch);

export default router;
