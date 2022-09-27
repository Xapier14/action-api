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

router.use(fields(["phoneNumber", "password"]));
router.post("/", (req, res) => {
  // get phoneNumber and password fields
  const phoneNumber = req.body.phoneNumber;
  const password = req.body.password;

  UserSchema.findOne({ phoneNumber: phoneNumber }, (err, user) => {
    // database error
    if (err) {
      databaseError(req, res, err);
      return;
    }

    // no phoneNumber OR password doesn't match
    if (
      user === null ||
      bcrypt.hashSync(password, user.salt) !== user.password
    ) {
      badLogin(res);
      return;
    }

    // verify access level
    const accessLevel =
      req.body.accessLevel && req.body.accessLevel >= 0
        ? req.body.accessLevel
        : 0;
    if (accessLevel > user.maxAccessLevel) {
      accessLevelTooHigh(res);
      return;
    }

    // authentication successful, create jwt token
    // create new session token
    const token = createSession(user.id, accessLevel);
    if (!token) {
      databaseError(req, res, "Failed to issue session token");
      return;
    }
    loginSuccess(res, token);
    // const jwtToken = createToken(phoneNumber, accessLevel, user.id);
    // const eat = jwt.decode(jwtToken).eat;
    // loginSuccess(res, jwtToken, eat);
  });
});

export default router;
