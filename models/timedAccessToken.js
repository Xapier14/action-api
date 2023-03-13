import { Schema, model } from "mongoose";
const TimedAccessTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "4h",
  },
  createdByUserId: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
});

export default model("TimedAccessToken", TimedAccessTokenSchema);
