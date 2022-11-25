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
export function invalidFileupload(res) {
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
export function incidentFound(res, incident) {
  res.send({
    status: "Incident found.",
    e: 0,
    incident: incident,
  });
}
export function buildingAdded(res, id) {
  res.send({
    status: "Building added.",
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
export function sendBuildingList(res, location, buildings) {
  res.send({
    status: `Buildings from '${location}' retrieved.`,
    e: 0,
    buildings: buildings,
  });
}
export function userResolved(res, userId, firstName, lastName, location) {
  res.send({
    status: "User resolved.",
    e: 0,
    userId: userId,
    user: {
      firstName: firstName,
      lastName: lastName,
      location: location,
    },
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
