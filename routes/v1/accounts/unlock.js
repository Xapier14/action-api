// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  accountUnlocked,
  accountNotFound,
} from "../../../modules/responseGenerator.js";

// models
import UserSchema from "../../../models/user.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  // get user
  try {
    const user = await UserSchema.findOne({ _id: id });
    if (user === null) {
      accountNotFound(res, id);
      return;
    }
    user.isLocked = false;
    user.badLoginAttempts = 0;
    await user.save();
    accountUnlocked(res);
  } catch {
    accountNotFound(res, id);
    return;
  }
});

export default router;
