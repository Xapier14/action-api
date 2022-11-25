/*
 * GET /check
 *   response:
 *    - 200: no session (e: 0, sessionState: 'noSession')
 *    - 200: valid session (e: 0, sessionState: 'validSession')
 *    - 200: invalid session (e: 0, sessionState: 'invalidSession')
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
  sendValidSession(
    res,
    token,
    user.id,
    user.firstName + " " + user.lastName,
    user.location,
    user.email,
    session.createdAt
  );
});

export default router;
