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
  badCaptcha,
  accountIsLocked,
} from "../../modules/responseGenerator.js";
import { createSession } from "../../modules/tokens.js";
import { isUsingRecaptcha, verifyTokenAsync } from "../../modules/recaptcha.js";
import {
  requireLicenseValid,
  requireLicensePresent,
} from "../../middlewares/licensing.js";

// models
import UserSchema from "../../models/user.js";

const router = Router();

router.use(requireLicensePresent);
router.use(requireLicenseValid);
router.use(fields(["email", "password", "g-recaptcha-token"]));
router.post("/", async (req, res) => {
  // get email and password fields
  const email = req.body.email?.toLowerCase() ?? "";
  const password = req.body.password;
  const recaptchaToken = req.body["g-recaptcha-token"];
  const recaptchaResult = await verifyTokenAsync(recaptchaToken, "login");
  if (isUsingRecaptcha() && recaptchaResult < 0.5) {
    badCaptcha(res);
    logger.log(
      req.ip,
      `Bad captcha attempt. (email: ${email}) (result: ${recaptchaResult})`,
      "",
      "warn",
      "",
      "login"
    );
    return;
  }
  try {
    const user = await UserSchema.findOne({ email: email });

    if (user === null) {
      badLogin(res);
      logger.log(
        req.ip,
        `Bad login attempt (user not found by email). (email: ${email})`,
        "",
        "warn",
        "",
        "login"
      );
      return;
    }

    // check if account is locked
    if (user.isLocked) {
      accountIsLocked(res);
      logger.log(
        req.ip,
        `Account is locked. (email: ${email})`,
        "",
        "warn",
        user.id,
        "login"
      );
      return;
    }

    // no email OR password doesn't match
    if (!(await bcrypt.compare(password, user.password))) {
      badLogin(res);
      // increment failed login attempts
      if (user !== null) {
        user.badLoginAttempts++;
        if (user.badLoginAttempts >= 5) {
          user.isLocked = true;
          user.lastLocked = Date.now();
          logger.log(
            req.ip,
            `Account locked due to bad login attempts. (email: ${email}) (attempts: ${
              user?.badLoginAttempts ?? 0
            })`,
            "",
            "warn",
            "",
            "login"
          );
          await user.save();
          return;
        }
        await user.save();
      }
      logger.log(
        req.ip,
        `Bad login attempt. (email: ${email}) (attempts: ${
          user?.badLoginAttempts ?? 0
        })`,
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
    if (accessLevel > (user.maxAccessLevel ?? 0)) {
      accessLevelTooHigh(res);
      logger.log(
        req.ip,
        `Insufficient account permissions. (email: ${email})`,
        "",
        "warn",
        user.id,
        "login"
      );
      return;
    }

    // authentication successful
    // create new session token
    const token = createSession(user.id, accessLevel);
    if (!token) {
      databaseError(req, res, "Failed to issue session token");
      logger.log(
        req.ip,
        `Failed to issue session token. (email: ${email})`,
        "",
        "error",
        user.id,
        "login"
      );
      return;
    }
    user.badLoginAttempts = 0;
    await user.save();
    loginSuccess(res, token, user.location);
    logger.log(
      req.ip,
      `Login successful. Captcha Score: ${recaptchaResult}. (email: ${email})`,
      token,
      "info",
      user.id,
      "login"
    );
  } catch (err) {
    databaseError(req, res, err);
    logger.err("login", err);
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
