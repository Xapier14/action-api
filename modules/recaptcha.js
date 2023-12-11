/*
 * recaptcha.js - Service Module
 *
 * Contains functions to interact with ReCaptcha Enterprise.
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

import fetch from "node-fetch";

let $siteKey = "";
let $apiKey = "";
let $projectId = "";

export function useRecaptcha(siteKey, apiKey, projectId) {
  $siteKey = siteKey;
  $projectId = projectId;
  $apiKey = apiKey;
  if (isUsingRecaptcha()) console.log("Using ReCaptcha...");
  else console.log("Configuration is blank, not using ReCaptcha...");
}
export function isUsingRecaptcha() {
  return $siteKey !== "" && $apiKey !== "" && $projectId !== "";
}
async function createAssessment(token, action) {
  const format = `https://recaptchaenterprise.googleapis.com/v1/projects/${$projectId}/assessments`;
  // build query
  const rawQuery = {
    key: $apiKey,
  };
  // uri encode query
  const query = Object.keys(rawQuery)
    .map((key) => `${key}=${encodeURIComponent(rawQuery[key])}`)
    .join("&");
  // build request
  const request = {
    event: {
      token: token,
      siteKey: $siteKey,
      expectedAction: action,
    },
  };
  // send request
  const response = await fetch(`${format}?${query}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return response.json();
}

export async function verifyTokenAsync(token, action) {
  if (!isUsingRecaptcha()) {
    // bypass if not using recaptcha
    return 1.69;
  }
  const response = await createAssessment(token, action);

  if (!response.tokenProperties?.valid == true) {
    console.log(
      "Invalid token, reason: " +
        (response.tokenProperties?.invalidReason ?? "n/a")
    );
    return -2.0;
  }

  if (response.tokenProperties.action !== action) {
    console.log("Invalid action");
    return -3.0;
  }

  return response?.riskAnalysis?.score ?? -4.0;
}
