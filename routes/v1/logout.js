import { Router } from "express";

import {
  generalInternalError,
  logoutSuccess,
  unauthorized,
} from "../../modules/responseGenerator.js";

import SessionSchema from "../../models/session.js";
import UserSchema from "../../models/user.js";
import logging from "../../modules/logging.js";

const router = Router();

router.post("/", async (req, res) => {
  const token = req.headers.authorization;
  try {
    const session = await SessionSchema.findOne({ token: token });
    const user = await UserSchema.findOne({ _id: session.userId });
    if (session === null) {
      unauthorized(res);
      return;
    }
    session.remove();
    logging.log(req.ip, "Logged out", session.token, "info", user.id, "logout");
    logoutSuccess(res);
  } catch (err) {
    generalInternalError(req, res);
    logger.err("login", err);
    logger.log(req.ip, `General error.`, "", "error", "", "logout");
  }
});

export default router;
