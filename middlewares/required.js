/*
 * Required - Express.js middleware
 * Lance Crisang - 2022
 *
 * Checks if the request body contains the required fields
 * and returns an error if it doesn't.
 *
 * Also has a function to check if the request body contains
 * the required fields and returns an array of missing fields.
 *
 * Requires 'responseGenerator.js'
 */

import { missingFields } from "../modules/responseGenerator.js";

export function check(req, params) {
  const missing = [];
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    if (!req.body[param]) {
      missing.push(param);
    }
  }
  return missing;
}
export function fields(params) {
  return (req, res, next) => {
    const missing = check(req, params);
    if (missing.length > 0) {
      missingFields(res, missing);
      return;
    }
    next();
  };
}
