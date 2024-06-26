import { Schema, model } from "mongoose";
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  maxAccessLevel: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  badLoginAttempts: {
    type: Number,
    default: 0,
  },
  lastLocked: {
    type: Date,
    default: null,
  },
});

export default model("User", UserSchema);
