/*
 * Authorization - Express.js middleware
 * Lance Crisang - 2022
 *
 * Checks if the user has the correct access level
 * to access the requested resource
 *
 * Requires 'responseGenerator.js' and 'tokens.js'
 */

import {
  accessLevelInsufficient,
  unauthorized,
} from "../modules/responseGenerator.js";
import { verifySession } from "../modules/tokens.js";

export function mustBeAccessLevel(accessLevel) {
  return async function (req, res, next) {
    try {
      const sessionToken = req.headers.authorization;
      const currentAccessLevel = await verifySession(sessionToken);
      if (!sessionToken || currentAccessLevel === null) {
        unauthorized(res);
        return;
      }
      if (currentAccessLevel >= accessLevel) {
        next();
      } else {
        accessLevelInsufficient(res);
        return;
      }
    } catch (err) {
      unauthorized(res);
      return;
    }
  };
}

export function mustBeValidToken(req, res, next) {
  if (verifySession(req.headers.authorization)) {
    next();
    return;
  }
  unauthorized(res);
}
