import { Router } from "express";

import { fields } from "../../../middlewares/required.js";
import { unauthorized } from "../../../modules/responseGenerator.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:id", (req, res) => {});

export default router;
