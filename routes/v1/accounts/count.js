// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  databaseError,
  sendAccountsCount,
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
  // get users
  try {
    const query = {};
    if (location) {
      query.location = location;
    }
    // count in db
    const count = await UserSchema.countDocuments(query);
    sendAccountsCount(res, count, location ?? undefined);
  } catch (err) {
    databaseError(req, res, err);
    logging.log(
      req.ip,
      "Error with database when fetching account count.",
      token,
      "error",
      userId,
      "accounts/count"
    );
    return;
  }
});
export default router;
