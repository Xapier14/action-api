// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  accountLocked,
  accountNotFound,
} from "../../../modules/responseGenerator.js";
import logging from "../../../modules/logging.js";

// models
import UserSchema from "../../../models/user.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.post("/:id", async (req, res) => {
  const id = req.params.id;
  const token = req.headers.authorization;

  // get user
  try {
    const user = await UserSchema.findOne({ _id: id });
    if (user === null) {
      accountNotFound(res, id);
      return;
    }
    user.isLocked = true;
    user.lastLocked = new Date();
    await user.save();
    accountLocked(res);
    logging.log(
      req.ip,
      `Account locked. (email: ${user.email})`,
      token,
      "admin",
      user.id,
      "lockAccount"
    );
  } catch {
    accountNotFound(res, id);
    return;
  }
});

export default router;
