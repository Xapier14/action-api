import { Schema, model } from "mongoose";
const DetailedErrorSchema = new Schema({
  dateTime: {
    type: Date,
    required: true,
    expires: "90d",
  },
  message: {
    type: String,
    required: true,
  },
  code: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
  },
  stack: {
    type: String,
  },
  cause: {
    type: String,
  },
});

export default model("DetailedError", DetailedErrorSchema);
