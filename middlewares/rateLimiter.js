/*
 * Rate Limiter - Express.js middleware
 * Lance Crisang - 2022
 *
 * Limits the number of requests per time period
 * for unauthorized and authorized users
 *
 * Requires 'tokens.js' and 'responseGenerator.js'
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
