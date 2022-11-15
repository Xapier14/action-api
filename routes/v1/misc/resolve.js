import { Router } from "express";

import {
  userResolved,
  userNotFound,
} from "../../../modules/responseGenerator.js";

import UserSchema from "../../../models/user.js";

const router = Router();

router.get("/", async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return userNotFound(res, 0);
  }
  try {
    const user = await UserSchema.findById(id);
    if (!user) {
      return userNotFound(res, id);
    }
    return userResolved(res, id, user.firstName, user.lastName, user.location);
  } catch (err) {
    return userNotFound(res, id);
  }
});

export default router;
