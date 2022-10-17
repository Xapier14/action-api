import fs from "fs";
import path from "path";

export function getBase64FromAttachmentId(attachmentId, extension) {
  const filePath = path.join("attachments", attachmentId + "." + extension);
  if (!fs.existsSync(filePath)) {
    console.log(`file ${filePath} does not exist`);
    return null;
  }

  const file = fs.readFileSync(filePath);
  const base64 = file.toString("base64");
  return base64;
}
