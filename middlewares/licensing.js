/*
 * licensing.js - Express.js middleware
 *
 * Checks if the license token is valid.
 *
 * Needs the 'License-Token' header to be set.
 *
 * Requires 'responseGenerator.js' and 'license.js'.
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

import { unauthorized } from "../modules/responseGenerator.js";
import { checkLicenseValid } from "../modules/license.js";

export function requireLicensePresent(req, res, next) {
  const licenseToken = req.headers["license-token"];
  if (!licenseToken) {
    console.log("license token not present");
    unauthorized(res);
    return;
  }
  next();
}

export function requireLicenseValid(req, res, next) {
  const licenseToken = req.headers["license-token"];

  if (!checkLicenseValid(licenseToken)) {
    console.log("license token not valid")
    unauthorized(res);
    return;
  }

  next();
}
