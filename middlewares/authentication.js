/*
 * Authentication - Express.js middleware
 * Lance Crisang - 2022
 *
 * Checks if the session token is valid.
 *
 * Needs the 'Authorization' header to be set.
 *
 * Requires 'responseGenerator.js' and 'tokens.js'
 */

import { unauthorized } from "../modules/responseGenerator.js";
import { verifySession } from "../modules/tokens.js";

const needsAuthentication = async (req, res, next) => {
  const accessLevel = await verifySession(req.headers.authorization);
  if (!req.headers.authorization || accessLevel === null) {
    unauthorized(res);
    return;
  }
  next();
};

export default needsAuthentication;
