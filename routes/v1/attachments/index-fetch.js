import { Router } from "express";

import { fields } from "../../../middlewares/required.js";

const router = Router();

router.get("/:id", (req, res) => {
  res.send(`Tried to fetch attachment with id: ${req.params.id}`);
});

export default router;
