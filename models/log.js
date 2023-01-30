import { Schema, model } from "mongoose";
const LogSchema = new Schema({
  sourceIp: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
    expires: "30d",
  },
  message: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    default: "",
  },
  userId: {
    type: String,
    default: "",
  },
  action: {
    type: String,
    default: "",
  },
});

export default model("Log", LogSchema);
