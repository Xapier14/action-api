/*
 * authorization.js - Express.js middleware
 *
 * Checks if the user has the correct access level
 * to access the requested resource
 *
 * Requires 'responseGenerator.js' and 'tokens.js'
 *
 * Copyright © 2023 Lance Crisang (Xapier14)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
