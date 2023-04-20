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

export function countLogs(action, ip, userId) {
  let actions = [];
  let ips = [];
  let userIds = [];
  if (typeof action === "string") {
    actions.push(action);
  } else {
    actions = action;
  }
  if (typeof ip === "string") {
    ips.push(ip);
  } else {
    ips = ip;
  }
  if (typeof userId === "string") {
    userIds.push(userId);
  } else {
    userIds = userId;
  }
  return new Promise(async (resolve, reject) => {
    const query = {};
    let and = [];
    if (actions.length > 0) {
      let or = [];
      for (let i = 0; i < actions.length; i++) {
        or.push({ action: actions[i] });
      }
      and.push({ $or: or });
    }
    if (ips.length > 0) {
      let or = [];
      for (let i = 0; i < ips.length; i++) {
        or.push({ sourceIp: ips[i] });
      }
      and.push({ $or: or });
    }
    if (userIds.length > 0) {
      let or = [];
      for (let i = 0; i < userIds.length; i++) {
        or.push({ userId: userIds[i] });
      }
      and.push({ $or: or });
    }
    if (and.length > 0) query.$and = and;
    try {
      const logs = await LogSchema.countDocuments(query).exec();
      resolve(logs);
    } catch (err) {
      console.log(err);
      reject(null);
    }
  });
}

export async function fetchLogs(pageOffset, limit, action, ip, userId) {
  return new Promise(async (resolve, reject) => {
    const query = {};
    let and = [];
    if (action.length > 0) {
      let or = [];
      for (let i = 0; i < action.length; i++) {
        or.push({ action: action[i] });
      }
      and.push({ $or: or });
    }
    if (ip.length > 0) {
      let or = [];
      for (let i = 0; i < ip.length; i++) {
        or.push({ sourceIp: ip[i] });
      }
      and.push({ $or: or });
    }
    if (userId.length > 0) {
      let or = [];
      for (let i = 0; i < userId.length; i++) {
        or.push({ userId: userId[i] });
      }
      and.push({ $or: or });
    }
    if (and.length > 0) query.$and = and;
    try {
      const logs = await LogSchema.find(query)
        .sort({ dateTime: -1 })
        .skip(pageOffset * limit)
        .limit(limit)
        .exec();
      let results = [];

      results = logs;
      resolve(results ?? []);
    } catch (err) {
      console.log(err);
      reject(null);
    }
  });
}
