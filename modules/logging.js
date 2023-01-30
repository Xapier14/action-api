import LogSchema from "../models/log.js";

export async function log(
  sourceIp,
  message,
  sessionId,
  level = "info",
  userId = "",
  action = ""
) {
  const dateTime = new Date();
  console.log(
    `[${dateTime.toISOString()}] [${level}] [${sourceIp}] [${message}]`
  );
  const maskedSessionId = sessionId ? sessionId.slice(0, 5) + "..." : "";
  await LogSchema.create({
    sourceIp: sourceIp,
    dateTime: dateTime,
    message: message,
    level: level,
    sessionId: maskedSessionId,
    userId: userId,
    action: action,
  });
}
export default {
  log,
};
