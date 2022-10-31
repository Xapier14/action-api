import { v4 as uuidv4 } from "uuid";
import SessionSchema from "../models/session.js";
import UserSchema from "../models/user.js";

const TOKEN_EXPIRATION = 60 * 60 * 24 * 7 * 1000; // 1 week

export function createSession(id, accessLevel) {
  const token = uuidv4();
  SessionSchema.create({
    token: token,
    userId: id,
    accessLevel: accessLevel,
  });
  return token;
}

export async function verifySession(token) {
  const session = await SessionSchema.findOne({ token: token }).exec();
  return session ? session.accessLevel : null;
}

export function revokeSession(token) {
  SessionSchema.deleteOne({ token: token });
}

export function revokeAllSessions(id) {
  SessionSchema.deleteMany({ userId: id });
}

export function revokeAllCreatedSessions() {
  SessionSchema.deleteMany({}, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

export function verifyJwt(token) {
  try {
    if (!jwt.verify(token, process.env.JWT_SECRET)) return false;
    if (jwt.decode(token).eat < Date.now()) return false;
    return true;
  } catch (err) {
    return false;
  }
}

export async function getLocationFromToken(token) {
  const session = await SessionSchema.findOne({ token: token }).exec();
  if (session === null) return null;
  const user = await UserSchema.findOne({ _id: session.userId }).exec();
  if (user === null) return null;
  return user.location;
}

export async function getUserIdFromToken(token) {
  const session = await SessionSchema.findOne({ token: token }).exec();
  if (session === null) return null;
  return session.userId;
}
