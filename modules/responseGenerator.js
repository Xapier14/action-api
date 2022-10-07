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

// server errors
export function databaseError(req, res, err) {
  console.log("Database error: " + err);
  console.log("from " + req.originalUrl);
  res.status(500).send({
    status: "Internal server error.",
    e: -1,
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
export function attachmentFetchSuccess(res, token, base64) {
  res.send({
    status: "Attachment fetch successful.",
    base64: base64 ?? "",
    e: 0,
    token: token,
  })
}