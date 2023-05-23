// packages
import { Router } from "express";

// modules
import {
  databaseError,
  buildingEdited,
  accountEdited,
  parameterOutOfRange,
  invalidParameter,
} from "../../../modules/responseGenerator.js";

// models
import UserSchema from "../../../models/user.js";
import logging from "../../../modules/logging.js";

const router = Router();

//router.use("/", fields(["name", "location", "maxCapacity"]));
router.post("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserSchema.findById(id);
    if (user === null) {
      buildingNotFound(res, id);
      return;
    }
    if (!req.body.firstName) return invalidParameter(res, "firstName");
    if (!req.body.lastName) return invalidParameter(res, "lastName");
    if (!req.body.email) return invalidParameter(res, "email");
    if (!req.body.location) return invalidParameter(res, "location");
    if (
      req.body.maxAccessLevel != undefined &&
      req.body.maxAccessLevel != null &&
      req.body.maxAccessLevel != "" &&
      isNaN(req.body.maxAccessLevel)
    )
      return invalidParameter(res, "maxAccessLevel");
    if (req.body.maxAccessLevel < 0 || req.body.maxAccessLevel > 1)
      return parameterOutOfRange(res, "maxAccessLevel", 0, 1);

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.location = req.body.location;
    user.maxAccessLevel = req.body.maxAccessLevel;
    await user.save();
    logging.log(
      req.ip,
      `User ${user._id} account data edited.`,
      req.headers.authorization,
      "info",
      user._id,
      "editAccount"
    );
    accountEdited(res);
  } catch (err) {
    databaseError(req, res, err);
    logging.log(
      req.ip,
      `Error with database when editing user account data.`,
      req.headers.authorization,
      "error",
      await getUserIdFromToken(req.headers.authorization),
      "editAccount"
    );
    logging.err("Account.Edit", err);
    return;
  }
});

export default router;
