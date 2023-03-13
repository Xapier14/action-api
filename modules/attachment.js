import fs, { promises as fsp } from "fs";
import { BlobServiceClient } from "@azure/storage-blob";
import azure from "azure-storage";
import path from "path";
import { exit } from "process";

const LOCAL_ROOT = "attachments/";
const CONTAINER_NAME = "uploaded-attachments";

let connectionString = null;
let blobServiceClient = null;
let azureBlobService = null;
let containterClient = null;

export async function useAzureStorage(azureConnectionString) {
  if (connectionString !== null) {
    console.log("Azure storage already in use");
    return;
  }
  connectionString = azureConnectionString;
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  azureBlobService = azure.createBlobService(connectionString);
  containterClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  const response = await containterClient.createIfNotExists({
    access: "blob",
  });
  if (!response.succeeded && response.errorCode !== "ContainerAlreadyExists") {
    console.log("[AzureClient] Failed to create container. Exiting...");
    console.log("[AzureClient] Error: " + response.errorCode);
    exit();
  }
}

export function isUsingAzureStorage() {
  return (
    connectionString !== null &&
    blobServiceClient !== null &&
    containterClient !== null
  );
}

export function clearLocalCache() {
  const directory = "localUploadCache";
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
}

function deleteLocally(attachmentId, extension) {
  const filePath = path.join("attachments", attachmentId + "." + extension);
  if (!fs.existsSync(filePath)) {
    console.log(`file ${filePath} does not exist`);
  }

  fsp.unlink(filePath, (err) => {
    if (err) throw err;
  });
}

function deleteFromAzure(attachmentId, extension) {
  const blobName = attachmentId + "." + extension;
  const blobClient = containterClient.getBlockBlobClient(blobName);
  blobClient.deleteIfExists({
    deleteSnapshots: "include",
  });
}

export function deleteAttachment(attachmentId, extension) {
  if (isUsingAzureStorage()) {
    deleteFromAzure(attachmentId, extension);
    return;
  }
  deleteLocally(attachmentId, extension);
}

async function saveLocally(id, mediaType, extension, filePath) {
  const localPath = LOCAL_ROOT + id + "." + extension;

  const readStream = fs.createReadStream(filePath);
  const writeStream = fs.createWriteStream(localPath);
  readStream.pipe(writeStream);
}

async function saveToAzure(attachmentId, mediaType, extension, filePath) {
  const blobName = attachmentId + "." + extension;
  const blobClient = containterClient.getBlockBlobClient(blobName);
  await blobClient.uploadFile(filePath);
  const blobHTTPHeaders = {
    blobContentType: mediaType,
  };
  blobClient.setHTTPHeaders(blobHTTPHeaders);
}

export async function saveAttachment(
  attachmentId,
  mediaType,
  extension,
  filePath
) {
  if (isUsingAzureStorage()) {
    await saveToAzure(attachmentId, mediaType, extension, filePath);
    await fsp.unlink(filePath);
    return;
  }
  await saveLocally(attachmentId, mediaType, extension, filePath);
  await fsp.unlink(filePath);
}

async function fetchLocally(fileName) {
  const filePath = path.join(LOCAL_ROOT, fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  } else {
    return await fsp.readFile(filePath);
  }
}

function fetchFromAzure(fileName) {
  var startDate = new Date();
  startDate.setMinutes(startDate.getMinutes() - 5);
  var expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 60 * 3);

  var permissions = azure.BlobUtilities.SharedAccessPermissions.READ;

  var sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: permissions,
      Start: startDate,
      Expiry: expiryDate,
    },
  };
  var sasToken = azureBlobService.generateSharedAccessSignature(
    CONTAINER_NAME,
    fileName,
    sharedAccessPolicy
  );
  var url = azureBlobService.getUrl(CONTAINER_NAME, fileName, sasToken);
  return url;
}

export async function fetchAttachment(fileName) {
  if (isUsingAzureStorage()) {
    return fetchFromAzure(fileName);
  }
  return await fetchLocally(fileName);
}
