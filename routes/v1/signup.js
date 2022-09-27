/*
 * POST /signup
 *   required fields: phoneNumber, password
 *   constraints:
 *    - phoneNumber must be a valid PH phone number in the format 09XXXXXXXXX or +639XXXXXXXXX
 *    - password must be at least 8 characters long;
 *       contain at least one uppercase letter;
 *       one lowercase letter;
 *       and one number
 *    - phoneNumber must not be in use
 *   response:
 *    - 200: signup successful (e: 0)
 *    - 400: bad phoneNumber (e: 2)
 *    - 400: weak password (e: 4)
 *    - 400: phoneNumber in use (e: 3)
 *    - 500: database error (e: -1)
 */

// packages
import { Router } from "express";
import bcrypt from "bcrypt";

// middlewares
import { fields } from "../../middlewares/required.js";

// modules
import {
  badPhoneNumber,
  databaseError,
  weakPassword,
  signupSuccess,
  phoneNumberInUse,
} from "../../modules/responseGenerator.js";
import { createSession } from "../../modules/tokens.js";
import { normalizePhoneNumber } from "../../modules/format.js";

// models
import UserSchema from "../../models/user.js";

const router = Router();

router.use(fields(["phoneNumber", "password"]));
router.post("/", (req, res) => {
  const phoneNumber = normalizePhoneNumber(req.body.phoneNumber);
  const password = req.body.password;

  // check if phoneNumber is invalid
  if (phoneNumber === null) {
    badPhoneNumber(res);
    return;
  }

  // check if phoneNumber is not in use
  UserSchema.findOne({ phoneNumber: phoneNumber }, (err, user) => {
    if (err) {
      // database returned error
      databaseError(req, res, err);
      return;
    }
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
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      // create new user
      UserSchema.create(
        {
          phoneNumber: phoneNumber,
          salt: salt,
          password: hash,
          maxAccessLevel: 0,
        },
        (err, newUser) => {
          // database error
          if (err) {
            databaseError(req, res, err);
            return;
          }
          // create jwt token
          const sessionToken = createSession(newUser.id, 0);
          signupSuccess(res, sessionToken);
        }
      );
    } else {
      // phoneNumber is in use
      phoneNumberInUse(res);
    }
    return;
  });
});

export default router;
