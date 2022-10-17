import { Schema, model } from "mongoose";
const AttachmentSchema = new Schema({
  uploader: {
    type: String,
    required: true,
  },
  mediaId: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    required: true,
  },
  mediaExtension: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("Attachment", AttachmentSchema);
