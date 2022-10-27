/*
 * POST /signup
 *   required fields: email, password
 *   required access level: 1
 *   constraints:
 *    - email must be a valid email
 *    - password must be at least 8 characters long;
 *       contain at least one uppercase letter;
 *       one lowercase letter;
 *       and one number
 *    - email must not be in use
 *   response:
 *    - 200: signup successful (e: 0)
 *    - 400: bad email (e: 2)
 *    - 400: weak password (e: 4)
 *    - 400: email in use (e: 3)
 *    - 500: database error (e: -1)
 */

// packages
import { Router } from "express";
import bcrypt from "bcrypt";

// middlewares
import { fields } from "../../middlewares/required.js";
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

// modules
import {
  badEmail,
  databaseError,
  weakPassword,
  signupSuccess,
  emailInUse,
} from "../../modules/responseGenerator.js";
import { createSession } from "../../modules/tokens.js";

// models
import UserSchema from "../../models/user.js";

const router = Router();

router.use(fields(["email", "password", "firstName", "lastName", "location"]));
router.use(mustBeAccessLevel(1));
router.post("/", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const location = req.body.location;
  const maxAccessLevel = Math.max(req.body.maxAccessLevel ?? 0, 0);

  // check if email is invalid
  if (email === null) {
    badEmail(res);
    return;
  }

  // check if email is not in use
  try {
    const user = await UserSchema.findOne({ email: email });
    if (user === null) {
      // check if password is weak
      // password must have at least 8 characters
      // and at least 1 uppercase letter, 1 lowercase letter, and 1 number
      if (
        password.length < 8 ||
        password.search(/[a-z]/) === -1 ||
        password.search(/[A-Z]/) === -1 ||
        password.search(/[0-9]/) === -1
      ) {
        weakPassword(res);
        return;
      }

      // create salt and hash
      const hash = bcrypt.hashSync(password, 10);

      // create new user
      const newUser = await UserSchema.create({
        email: email,
        password: hash,
        firstName: firstName,
        lastName: lastName,
        location: location,
        maxAccessLevel: maxAccessLevel,
      });
      // create jwt token
      const sessionToken = createSession(newUser.id, 0);
      signupSuccess(res, sessionToken);
    } else {
      // email is in use
      emailInUse(res);
    }
  } catch (err) {
    databaseError(req, res, err);
  }
  return;
});

export default router;
