import { Router } from "express";

import {
  logoutSuccess,
  unauthorized,
} from "../../modules/responseGenerator.js";

import SessionSchema from "../../models/session.js";
import UserSchema from "../../models/user.js";
import logging from "../../modules/logging.js";

const router = Router();

router.post("/", async (req, res) => {
  const token = req.headers.authorization;
  const session = await SessionSchema.findOne({ token: token });
  const user = await UserSchema.findOne({ _id: session.userId });
  if (session === null) {
    unauthorized(res);
    return;
  }
  session.remove();
  logging.log(
    req.ip,
    "Logged out",
    session.token,
    "info",
    user.firstName + "_" + user.lastName,
    "logout"
  );
  logoutSuccess(res);
});

export default router;
