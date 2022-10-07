import fs from 'fs';
import path from 'path';

export function getBase64FromAttachmentId(attachmentId) {
  const filePath = path.join("attachments", attachmentId);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const file = fs.readFileSync(filePath);
  const base64 = file.toString("base64");
  return base64;
}