export function getAllAllowedMimeTypes() {
  return ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
}

export function checkMimeType(mimeType) {
  if (mimeType == null) {
    return false;
  }
  const imageTypes = ["image/jpeg", "image/png", "image/webp"];
  const videoTypes = ["video/mp4", "video/webm"];
  if (imageTypes.includes(mimeType)) {
    return "image";
  }
  if (videoTypes.includes(mimeType)) {
    return "video";
  }
  return false;
}
