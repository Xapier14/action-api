import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

let siteKey = "";
let projectId = "";
let recaptchaClient = null;

export function useRecaptchaAsync(siteKey, projectId) {
  if (recaptchaClient !== null) {
    console.log("Recaptcha already in use");
    return;
  }
  siteKey = siteKey;
  projectId = projectId;
  recaptchaClient = new RecaptchaEnterpriseServiceClient();
  recaptchaClient.projectPath(projectId);
}

export function isUsingRecaptcha() {
  return recaptchaClient !== null;
}

export async function verifyTokenAsync(token, action) {
  if (!isUsingRecaptcha()) {
    return -1.0;
  }
  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: siteKey,
      },
      parent: projectId,
    },
  };

  const [response] = await recaptchaClient.createAssessment(request);

  if (!response.tokenProperties.valid) {
    console.log(
      "Invalid token, reason: " + response.tokenProperties.invalidReason
    );
    return -2.0;
  }

  if (response.tokenProperties.action !== action) {
    console.log("Invalid action");
    return -3.0;
  }

  return response?.riskAnalysis?.reasons ?? -4.0;
}
