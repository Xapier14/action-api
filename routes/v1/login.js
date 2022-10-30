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

router.use(fields(["email", "password"]));
router.post("/", async (req, res) => {
  console.log("try log");
  // get email and password fields
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await UserSchema.findOne({ email: email });

    // no email OR password doesn't match
    if (user === null || !(await bcrypt.compare(password, user.password))) {
      console.log("bad login");
      badLogin(res);
      return;
    }

    // verify access level
    const accessLevel =
      req.body.accessLevel && req.body.accessLevel >= 0
        ? req.body.accessLevel
        : 0;
    if (accessLevel > user.maxAccessLevel) {
      console.log("access level too high");
      accessLevelTooHigh(res);
      return;
    }

    // authentication successful, create jwt token
    // create new session token
    const token = createSession(user.id, accessLevel);
    if (!token) {
      console.log("database error");
      databaseError(req, res, "Failed to issue session token");
      return;
    }
    console.log("login success");
    loginSuccess(res, token);
  } catch (err) {
    console.log("database error");
    databaseError(req, res, err);
  }
});

export default router;
