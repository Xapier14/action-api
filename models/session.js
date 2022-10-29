import { Schema, model } from "mongoose";
const SessionSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  accessLevel: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "4h",
  },
});

export default model("Session", SessionSchema);
