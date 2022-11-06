import { Router } from "express";

import {
  logoutSuccess,
  unauthorized,
} from "../../modules/responseGenerator.js";

import SessionSchema from "../../models/session.js";

const router = Router();

router.post("/", async (req, res) => {
  const token = req.headers.authorization;
  const session = await SessionSchema.findOne({ token: token });
  if (session === null) {
    unauthorized(res);
    return;
  }
  session.remove();
  logoutSuccess(res);
});

export default router;
