/*
 * GET /check
 */

// packages
import { Router } from "express";

// modules
import {
  sendNoSession,
  sendInvalidSession,
  sendValidSession,
} from "../../modules/responseGenerator.js";

// models
import UserSchema from "../../models/user.js";
import SessionSchema from "../../models/session.js";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    sendNoSession(res);
    return;
  }
  const session = await SessionSchema.findOne({ token });
  if (session === null) {
    sendInvalidSession(res);
    return;
  }
  const user = await UserSchema.findOne({ _id: session.userId });
  if (user === null) {
    sendInvalidSession(res);
    return;
  }
  sendValidSession(res, token, user.email, session.createdAt);
});

export default router;
