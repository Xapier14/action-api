/*
 * required.js - Express.js middleware
 *
 * Checks if the request body contains the required fields
 * and returns an error if it doesn't.
 *
 * Also has a function to check if the request body contains
 * the required fields and returns an array of missing fields.
 *
 * Requires 'responseGenerator.js'
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
