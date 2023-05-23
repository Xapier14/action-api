// packages
import { Router } from "express";

// modules
import {
  databaseError,
  sendAccountList,
} from "../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";

// models
import UserSchema from "../../../models/user.js";
import logging from "../../../modules/logging.js";

const router = Router();

router.get("/", async (req, res) => {
  const location = req.query.location;
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  // get buildings
  try {
    const query = {};
    if (
      location &&
      location !== "all" &&
      location !== "All" &&
      location !== "ALL" &&
      location !== ""
    ) {
      query.location = location;
    }
    const users = await UserSchema.find(query);
    const userList = [];
    for (const user of users) {
      userList.push({
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
    }
    sendAccountList(res, location ?? "All", userList);
  } catch (err) {
    databaseError(req, res, err);
    logging.log(
      req.ip,
      "Error with database when fetching account list.",
      token,
      "error",
      userId,
      "accounts/list"
    );
    logging.err("Accounts.List", err);
    return;
  }
});
export default router;
