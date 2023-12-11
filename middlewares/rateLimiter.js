/*
 * rateLimiter.js - Express.js middleware
 *
 * Limits the number of requests per time period
 * for unauthorized and authorized users
 *
 * To make this scale, we would need to use a database
 * to store the requests and their counts
 *
 * Requires 'tokens.js' and 'responseGenerator.js'
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

import { tooManyRequests } from "../modules/responseGenerator.js";
import { verifySession } from "../modules/tokens.js";

var requests = [];
const MAX_UNAUTHORIZED_REQUESTS = 10;
const MAX_AUTHORIZED_REQUESTS = 1000;
const TIME_PERIOD = 1000 * 60;
const TOKEN_FIELD = "Authorization";

function addOrIncrement(identifier, isIp) {
  let req;
  let found = false;
  requests.forEach((request) => {
    if (request.id === identifier) {
      req = request;
      found = true;
    }
  });
  if (!found) {
    req = {
      id: identifier,
      lastRequested: Date.now(),
      count: 1,
    };
    requests.push(req);
  } else {
    if (req.id == identifier) {
      if (Date.now() - req.lastRequested > TIME_PERIOD) {
        req.lastRequested = Date.now();
        req.count = 1;
      } else {
        req.count++;
      }
      const max_requests = isIp
        ? MAX_UNAUTHORIZED_REQUESTS
        : MAX_AUTHORIZED_REQUESTS;
      return req.count > max_requests;
    }
  }
  return false;
}

const rateLimiter = (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const token = req.get(TOKEN_FIELD);
  const isIp = token === undefined || !verifySession(token);
  const status = addOrIncrement(token ?? ip, isIp);
  if (status) {
    tooManyRequests(res);
    return;
  }
  next();
};

export default rateLimiter;
