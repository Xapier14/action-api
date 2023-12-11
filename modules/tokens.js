/*
 * tokens.js - Service Module
 *
 * Handles session creation, verification and revocation.
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
