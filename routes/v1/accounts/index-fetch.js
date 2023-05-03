// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  accountFound,
  accountNotFound,
} from "../../../modules/responseGenerator.js";
import logger from "../../../modules/logging.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";

// models
import UserSchema from "../../../models/user.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const token = req.headers.authorization;

  // get user
  try {
    const user = await UserSchema.findOne({ _id: id });
    if (user === null) {
      accountNotFound(res, id);
      return;
    }

    accountFound(res, {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
      maxAccessLevel: user.maxAccessLevel,
      createdAt: user.createdAt,
      isLocked: user.isLocked,
      lastLocked: user.lastLocked,
    });
  } catch {
    // logger.log(
    //   req.ip,
    //   "Error with database when fetching account data.",
    //   token,
    //   "error",
    //   await getUserIdFromToken(token)
    // );
    accountNotFound(res, id);
    return;
  }
});

export default router;
