import { Schema, model } from "mongoose";
const IncidentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
    required: true,
  },
  attachments: {
    type: Array,
  },
  reportedOn: {
    type: Date,
    default: Date.now,
  },
  reportedBy: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
});

export default model("Incident", IncidentSchema);
