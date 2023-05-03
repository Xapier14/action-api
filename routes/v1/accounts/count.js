// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  databaseError,
  sendAccountsCount,
} from "../../../modules/responseGenerator.js";

// models
import UserSchema from "../../../models/user.js";

const router = Router();

router.get("/", async (req, res) => {
  const location = req.query.location;
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
    return;
  }
});
export default router;
