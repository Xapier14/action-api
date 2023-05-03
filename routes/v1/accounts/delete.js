// packages
import { Router } from "express";

// modules
import {
  accountNotFound,
  accountDeleted,
  mustNotBeCurrentAccount,
} from "../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";
import { revokeAllSessions } from "../../../modules/tokens.js";
import logging from "../../../modules/logging.js";

// models
import UserSchema from "../../../models/user.js";

const router = Router();
router.delete("/:id", async (req, res) => {
  const token = req.headers.authorization;
  const id = req.params.id;
  const currentId = await getUserIdFromToken(token);
  if (id === currentId) {
    mustNotBeCurrentAccount(res);
    return;
  }

  const user = await UserSchema.findOne({ _id: id });
  if (user === null) {
    accountNotFound(res, id);
    return;
  }
  revokeAllSessions(id);
  await user.remove();
  logging.log(
    req.ip,
    "Account deleted.",
    token,
    "info",
    currentId,
    "deleteAccount"
  );
  accountDeleted(res);
});

export default router;
