// client errors
export function badLogin(res) {
  res.status(400).send({
    status: "Invalid username or password.",
    e: 1,
  });
}
export function badPhoneNumber(res) {
  res.status(400).send({
    status: "Invalid phone number.",
    e: 2,
  });
}
export function phoneNumberInUse(res) {
  res.status(400).send({
    status: "Phone number is already in use.",
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

// success responses
export function loginSuccess(res, token) {
  res.send({
    status: "Login successful.",
    e: 0,
    token: token,
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
export function incidentReportSuccess(res, token, incidentId) {
  res.send({
    status: "Incident report successful.",
    e: 0,
    incidentId: incidentId,
    token: token,
  });
}
