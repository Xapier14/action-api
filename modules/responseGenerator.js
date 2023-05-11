// client errors
export function badLogin(res) {
  res.status(400).send({
    status: "Invalid email or password.",
    e: 1,
  });
}
export function badEmail(res) {
  res.status(400).send({
    status: "Invalid email.",
    e: 2,
  });
}
export function emailInUse(res) {
  res.status(400).send({
    status: "Email is already in use.",
    e: 3,
  });
}
export function weakPassword(res) {
  res.status(400).send({
    status: "Password is too weak.",
    e: 4,
  });
}
export function accessLevelTooHigh(res) {
  res.status(403).send({
    status: "Requested access level is too high.",
    e: 5,
  });
}
export function accessLevelInsufficient(res) {
  res.status(401).send({
    status: "Access level is insufficient.",
    e: 6,
  });
}
export function unauthorized(res) {
  res.status(401).send({
    status: "Unauthorized.",
    e: 7,
  });
}
export function tooManyRequests(res) {
  res.status(429).send({
    status: "Too many requests.",
    e: 8,
  });
}
export function invalidFileUpload(res) {
  res.status(400).send({
    status: "Invalid file upload.",
    e: 9,
  });
}
export function attachmentNotFound(res) {
  res.status(404).send({
    status: "Attachment not found.",
    e: 10,
  });
}
export function missingFields(res, fields) {
  res.status(400).send({
    status: "Missing required field(s).",
    e: 11,
    fields: fields,
  });
}
export function incidentNotFound(res, id) {
  res.status(404).send({
    status: "Incident not found.",
    e: 12,
    incidentId: id,
  });
}
export function buildingNotFound(res, id) {
  res.status(404).send({
    status: "Building not found.",
    e: 13,
    buildingId: id,
  });
}
export function accountNotFound(res, id) {
  res.status(404).send({
    status: "Account not found.",
    e: 13,
    accountId: id,
  });
}
export function parameterOutOfRange(res, parameter, min, max) {
  res.status(400).send({
    status: "Parameter out of range.",
    e: 14,
    parameter: parameter,
    min: min,
    max: max,
  });
}
export function invalidParameter(res, parameter) {
  res.status(400).send({
    status: "Invalid parameter.",
    e: 15,
    parameter: parameter,
  });
}
export function userNotFound(res, id) {
  res.status(404).send({
    status: "User not found.",
    e: 16,
    userId: id,
  });
}
export function fileNotFound(res) {
  res.status(404).send({
    status: "File not found.",
    e: 17,
  });
}
export function badCaptcha(res) {
  res.status(400).send({
    status: "Invalid captcha response.",
    e: 18,
  });
}
export function accountIsLocked(res) {
  res.status(403).send({
    status: "Account is locked.",
    e: 19,
  });
}
export function invalidPassword(res) {
  res.status(400).send({
    status: "Invalid password.",
    e: 20,
  });
}
export function mustNotBeCurrentAccount(res) {
  res.status(400).send({
    status: "Must not be current account.",
    e: 21,
  });
}

// server errors
export function databaseError(req, res, err) {
  console.log("Database error: " + err);
  console.log("from " + req.originalUrl);
  res.status(500).send({
    status: "Internal server error.",
    e: -1,
  });
}
export function internalFileReadError(req, res, err) {
  console.log("File read error: " + err);
  console.log("from " + req.originalUrl);
  res.status(500).send({
    status: "Internal server error.",
    e: -2,
  });
}
export function generalInternalError(req, res) {
  console.log("General internal error.");
  console.log("from " + req.originalUrl);
  res.status(500).send({
    status: "Internal server error.",
    e: -3,
  });
}

// success responses
export function loginSuccess(res, token, location) {
  res.send({
    status: "Login successful.",
    e: 0,
    token: token,
    location: location,
  });
}
export function logoutSuccess(res) {
  res.send({
    status: "Logout successful.",
    e: 0,
  });
}
export function signupSuccess(res, token) {
  res.send({
    status: "Signup successful.",
    e: 0,
    token: token,
  });
}
export function attachmentUploadSuccess(
  res,
  token,
  attachmentId,
  attachmentType
) {
  res.send({
    status: "Attachment upload successful.",
    e: 0,
    attachmentId: attachmentId,
    attachmentType: attachmentType,
    token: token,
  });
}
export function attachmentDeleteSuccess(res, token) {
  res.send({
    status: "Attachment delete successful.",
    e: 0,
    token: token,
  });
}
export function incidentReportSuccess(res, token, incidentId) {
  res.send({
    status: "Incident report successful.",
    e: 0,
    incidentId: incidentId,
    token: token,
  });
}
export function sendListOfReports(
  res,
  token,
  reports,
  pageOffset,
  maxPageOffset,
  limit,
  totalReportCount
) {
  res.send({
    status: `Retrieved page ${pageOffset} of ${maxPageOffset} with ${reports.length} report(s).`,
    e: 0,
    pageOffset: pageOffset,
    maxPageOffset: maxPageOffset,
    limit: limit,
    reports: reports,
    reportCount: reports.length,
    totalReportCount: totalReportCount,
    token: token,
  });
}
export function sendLogs(
  res,
  token,
  logs,
  pageOffset,
  maxPageOffset,
  limit,
  totalLogCount
) {
  res.send({
    status: `Retrieved page ${pageOffset} of ${maxPageOffset} with ${logs.length} log(s).`,
    e: 0,
    pageOffset: pageOffset,
    maxPageOffset: maxPageOffset,
    limit: limit,
    logs: logs,
    logCount: logs.length,
    totalLogCount: totalLogCount,
    token: token,
  });
}
export function sendAccountsCount(res, count, location) {
  if (location == undefined) {
    res.send({
      status: "Counted accounts.",
      e: 0,
      count: count,
    });
    return;
  }
  res.send({
    status: "Counted accounts.",
    e: 0,
    count: count,
    location: location,
  });
}
export function sendReportsCount(res, count, location, building) {
  if (building == undefined) {
    res.send({
      status: "Counted reports.",
      e: 0,
      location: location,
      count: count,
    });
    return;
  }
  res.send({
    status: "Counted reports.",
    e: 0,
    location: location,
    buildingId: building,
    count: count,
  });
}
export function passwordChanged(res) {
  res.send({
    status: "Password changed.",
    e: 0,
  });
}
export function incidentFound(res, incident) {
  res.send({
    status: "Incident found.",
    e: 0,
    incident: incident,
  });
}
export function incidentDeleted(res) {
  res.send({
    status: "Incident deleted.",
    e: 0,
  });
}
export function buildingFound(res, building) {
  res.send({
    status: "Building found.",
    e: 0,
    building: building,
  });
}
export function accountFound(res, account) {
  res.send({
    status: "Account found.",
    e: 0,
    account: account,
  });
}
export function buildingAdded(res, id) {
  res.send({
    status: "Building added.",
    e: 0,
    buildingId: id,
  });
}
export function buildingEdited(res, id) {
  res.send({
    status: "Building edited.",
    e: 0,
    buildingId: id,
  });
}
export function buildingDeleted(res) {
  res.send({
    status: "Building deleted.",
    e: 0,
  });
}
export function accountDeleted(res) {
  res.send({
    status: "Account deleted.",
    e: 0,
  });
}
export function accountUnlocked(res) {
  res.send({
    status: "Account unlocked.",
    e: 0,
  });
}
export function accountLocked(res) {
  res.send({
    status: "Account locked.",
    e: 0,
  });
}
export function accountEdited(res) {
  res.send({
    status: "Account edited.",
    e: 0,
  });
}
export function sendBuildingList(res, location, buildings) {
  res.send({
    status: `Buildings from '${location}' retrieved.`,
    e: 0,
    buildings: buildings,
  });
}
export function sendAccountList(res, location, accounts) {
  res.send({
    status: `Accounts from '${location}' retrieved.`,
    e: 0,
    accounts: accounts,
  });
}
export function accountNameResolved(
  res,
  userId,
  firstName,
  lastName,
  location
) {
  res.send({
    status: "Account name resolved.",
    e: 0,
    userId: userId,
    user: {
      firstName: firstName,
      lastName: lastName,
      location: location,
    },
  });
}
export function attachmentFound(res, fileName, contentType, token, expires) {
  res.send({
    status: "Attachment found.",
    e: 0,
    fileName: fileName,
    contentType: contentType,
    accessToken: token,
    expires: expires,
  });
}

// misc responses
export function sendNoSession(res) {
  res.send({
    status: "No session.",
    sessionState: "noSession",
    e: 0,
  });
}
export function sendInvalidSession(res) {
  res.send({
    status: "Invalid session.",
    sessionState: "invalidSession",
    e: 0,
  });
}
export function sendValidSession(
  res,
  token,
  id,
  name,
  location,
  email,
  createdAt
) {
  res.send({
    status: "Valid session.",
    sessionState: "validSession",
    e: 0,
    token: token,
    id: id,
    name: name,
    location: location,
    email: email,
    createdAt: createdAt,
  });
}
