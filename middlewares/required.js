/*
 * Required - Express.js middleware
 * Lance Crisang - 2022
 *
 * Checks if the request body contains the required fields
 * and returns an error if it doesn't.
 *
 * Also has a function to check if the request body contains
 * the required fields and returns an array of missing fields.
 */

const MISSING_FIELD_MSG = "Missing required field(s).";

export function check(req, params) {
  const missing = [];
  params.forEach((param) => {
    if (!req.body[param]) {
      missing.push(param);
    }
  });
  return missing;
}
export function fields(params) {
  return (req, res, next) => {
    const missing = check(req, params);
    if (missing.length > 0) {
      res.status(400).send({
        status: MISSING_FIELD_MSG,
        fields: missing,
      });
      return;
    }
    next();
  };
}
