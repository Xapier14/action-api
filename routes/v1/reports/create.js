import { Router } from "express";

import { fields } from "../../../middlewares/required.js";

const router = Router();

router.post("/", (req, res) => {
  res.send("Hello World!");
});

export default router;
