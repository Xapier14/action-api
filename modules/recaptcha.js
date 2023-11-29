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
