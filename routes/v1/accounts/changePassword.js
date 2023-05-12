// packages
import { Router } from "express";
import bcrypt from "bcrypt";

// middlewares
import { fields } from "../../../middlewares/required.js";

// modules
import {
  unauthorized,
  accountNotFound,
  databaseError,
  passwordChanged,
  invalidPassword,
  weakPassword,
} from "../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";
import logging from "../../../modules/logging.js";

// models
import UserSchema from "../../../models/user.js";

const router = Router();

router.post("/", async (req, res) => {
  const token = req.headers.authorization;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  if (oldPassword == undefined || newPassword == undefined) {
    unauthorized(res);
    return;
  }
  const id = await getUserIdFromToken(token);
  // get users
  try {
    const user = await UserSchema.findOne({ _id: id });
    if (user === null) {
      unauthorized(res);
      return;
    }
    // check if password is weak
    // password must have at least 8 characters
    // and at least 1 uppercase letter, 1 lowercase letter, and 1 number
    if (
      newPassword.length < 8 ||
      newPassword.search(/[a-z]/) === -1 ||
      newPassword.search(/[A-Z]/) === -1 ||
      newPassword.search(/[0-9]/) === -1
    ) {
      weakPassword(res);
      return;
    }

    const oldMatches = await bcrypt.compare(oldPassword, user.password);
    if (!oldMatches) {
      invalidPassword(res);
      return;
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    user.password = hash;
    await user.save();
    logging.log(
      req.ip,
      `Password changed for user ${id}`,
      "",
      "info",
      "",
      "changePassword"
    );
    passwordChanged(res);
  } catch (err) {
    databaseError(req, res, err);
    return;
  }
});

router.use("/:id", fields(["newPassword"]));
router.post("/:id", async (req, res) => {
  const id = req.params.id;
  const newPassword = req.body.newPassword;
  // get users
  try {
    const user = await UserSchema.findOne({ _id: id });
    if (user === null) {
      accountNotFound(res, id);
      return;
    }
    // check if password is weak
    // password must have at least 8 characters
    // and at least 1 uppercase letter, 1 lowercase letter, and 1 number
    if (
      newPassword.length < 8 ||
      newPassword.search(/[a-z]/) === -1 ||
      newPassword.search(/[A-Z]/) === -1 ||
      newPassword.search(/[0-9]/) === -1
    ) {
      weakPassword(res);
      return;
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    user.password = hash;
    await user.save();
    logging.log(
      req.ip,
      `Password changed for user ${id}`,
      "",
      "info",
      "",
      "changePassword"
    );
    passwordChanged(res);
  } catch (err) {
    databaseError(req, res, err);
    return;
  }
});
export default router;
