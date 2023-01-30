/*
 * POST /login
 *   required fields: phoneNumber, password
 *   optional fields: accessLevel
 *
 *   response:
 *    - 200: login successful (e: 0)
 *    - 400: bad login (e: 1)
 *    - 403: requested access level too high (e: 5)
 *    - 500: database error (e: -1)
 */

// packages
import { Router } from "express";
import bcrypt from "bcrypt";
import logger from "../../modules/logging.js";

// middlewares
import { fields } from "../../middlewares/required.js";

// modules
import {
  badLogin,
  loginSuccess,
  accessLevelTooHigh,
  databaseError,
} from "../../modules/responseGenerator.js";
import { createSession } from "../../modules/tokens.js";

// models
import UserSchema from "../../models/user.js";

const router = Router();

router.use(fields(["email", "password"]));
router.post("/", async (req, res) => {
  // get email and password fields
  const email = req.body.email?.toLowerCase() ?? "";
  const password = req.body.password;

  try {
    const user = await UserSchema.findOne({ email: email });

    // no email OR password doesn't match
    if (user === null || !(await bcrypt.compare(password, user.password))) {
      badLogin(res);
      logger.log(
        req.ip,
        `Bad login attempt. (email: ${email})`,
        "",
        "warn",
        "",
        "login"
      );
      return;
    }

    // verify access level
    const accessLevel =
      req.body.accessLevel && req.body.accessLevel >= 0
        ? req.body.accessLevel
        : 0;
    if (accessLevel > user.maxAccessLevel) {
      accessLevelTooHigh(res);
      logger.log(
        req.ip,
        `Insufficient account permissions. (email: ${email})`,
        "",
        "warn",
        user.firstName + "_" + user.lastName,
        "login"
      );
      return;
    }

    // authentication successful, create jwt token
    // create new session token
    const token = createSession(user.id, accessLevel);
    if (!token) {
      databaseError(req, res, "Failed to issue session token");
      logger.log(
        req.ip,
        `Failed to issue session token. (email: ${email})`,
        "",
        "error",
        "",
        "login"
      );
      return;
    }
    loginSuccess(res, token, user.location);
    logger.log(
      req.ip,
      `Login successful.`,
      token,
      "info",
      user.firstName + "_" + user.lastName,
      "login"
    );
  } catch (err) {
    databaseError(req, res, err);
    logger.log(
      req.ip,
      `Database error. (email: ${email})`,
      "",
      "error",
      "",
      "login"
    );
  }
});

export default router;
