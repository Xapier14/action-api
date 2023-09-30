import azure from "azure-storage";
import { BlobServiceClient } from "@azure/storage-blob";
import * as ftp from "basic-ftp";
import path from "path";
import fs, { promises as fsp } from "fs";
import { exit } from "process";
import { generateThumbnail } from "./ffmpeg.js";
import { Stream } from "stream";
import { WMStream } from "./wmStream.js";

// Azure
const CONTAINER_NAME = "uploaded-attachments";
let azureConnectionString = null;
let blobServiceClient = null;
let azureBlobService = null;
let containerClient = null;

// FTP
let ftpConnectionString = null;
let ftpClient = null;
let ftpHost = null;
let ftpUsername = null;
let ftpPassword = null;
let ftpPort = null;
let ftpIsSecure = null;

// Local
const LOCAL_ROOT = "attachments/";

export async function useAzureStorage(connectionString) {
  if (azureConnectionString !== null) {
    console.log("Azure storage already in use");
    return;
  }
  azureConnectionString = connectionString;
  blobServiceClient = BlobServiceClient.fromConnectionString(
    azureConnectionString
  );
  azureBlobService = azure.createBlobService(azureConnectionString);
  containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  const response = await containerClient.createIfNotExists({
    access: "blob",
  });
  if (!response.succeeded && response.errorCode !== "ContainerAlreadyExists") {
    console.log("[AzureClient] Failed to create container. Exiting...");
    console.log("[AzureClient] Error: " + response.errorCode);
    exit();
  }
}

export async function useFtpStorage(connectionString) {
  // connection string is in the form of "ftps://username:password@hostname" or "ftp://username:password@hostname"
  const isSecure = connectionString.startsWith("ftps://");
  if (!isSecure && !connectionString.startsWith("ftp://")) {
    console.log("Invalid FTP connection string");
    return;
  }
  if (ftpConnectionString !== null) {
    console.log("FTP already in use");
    return;
  }
  let hostname = connectionString.split("@")[1];
  const username = connectionString.split("@")[0].split("//")[1].split(":")[0];
  const password = connectionString.split("@")[0].split("//")[1].split(":")[1];
  // if hostname is in the form of "hostname:port", extract the port
  let port = 21;
  if (hostname.includes(":")) {
    port = parseInt(hostname.split(":")[1]);
    hostname = hostname.split(":")[0];
  }

  ftpConnectionString = connectionString;
  ftpClient = new ftp.Client();
  ftpClient.ftp.verbose = true;
  ftpClient.downlo;
  try {
    ftpHost = hostname;
    ftpUsername = username;
    ftpPassword = password;
    ftpPort = port;
    ftpIsSecure = isSecure;
    console.log(`[FTPClient] Connecting to ${hostname}...`);
    console.log(`[FTPClient] Secure? ${isSecure}`);
    await ftpClient.access({
      host: hostname,
      user: username,
      password: password,
      secure: isSecure,
      port: port,
    });
  } catch (err) {
    console.log("[FTPClient] Failed to connect. Exiting...");
    console.log(err);
    ftpClient.close();
    exit();
  }
}

export function isUsingAzureStorage() {
  return (
    azureConnectionString !== null &&
    blobServiceClient !== null &&
    containerClient !== null
  );
}

export function isUsingFtpStorage() {
  return ftpConnectionString !== null && ftpClient !== null;
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

async function deleteFtp(attachmentId, extension) {
  if (ftpClient.closed) {
    console.log("FTP client is closed");
    try {
      await ftpClient.access({
        host: ftpHost,
        user: ftpUsername,
        password: ftpPassword,
        secure: ftpIsSecure,
        port: ftpPort,
      });
    } catch (err) {
      console.log("[FTPClient] Failed to connect. Exiting...");
      console.log(err);
      return null;
    }
  }

  const fileName = attachmentId + "." + extension;
  await ftpClient.remove(fileName);
}

function deleteFromAzure(attachmentId, extension) {
  const blobName = attachmentId + "." + extension;
  const blobClient = containerClient.getBlockBlobClient(blobName);
  blobClient.deleteIfExists({
    deleteSnapshots: "include",
  });
}

export function deleteAttachment(attachmentId, extension) {
  if (isUsingAzureStorage()) {
    deleteFromAzure(attachmentId, extension);
    deleteFromAzure(`${attachmentId}-thumb`, extension);
    return;
  }
  if (isUsingFtpStorage()) {
    deleteFtp(attachmentId, extension);
    deleteFtp(`${attachmentId}-thumb`, extension);
    return;
  }
  // use sftp client
  deleteLocally(attachmentId, extension);
  deleteLocally(`${attachmentId}-thumb`, extension);
}

async function saveLocally(fileName, filePath) {
  const localPath = LOCAL_ROOT + fileName;

  const readStream = fs.createReadStream(filePath);
  const writeStream = fs.createWriteStream(localPath);
  readStream.pipe(writeStream);
}

async function saveFtp(fileName, filePath) {
  if (ftpClient.closed) {
    console.log("FTP client is closed");
    try {
      await ftpClient.access({
        host: ftpHost,
        user: ftpUsername,
        password: ftpPassword,
        secure: ftpIsSecure,
        port: ftpPort,
      });
    } catch (err) {
      console.log("[FTPClient] Failed to connect. Exiting...");
      console.log(err);
      return null;
    }
  }

  const readStream = fs.createReadStream(filePath);
  await ftpClient.uploadFrom(readStream, fileName);
}

async function saveToAzure(blobName, mediaType, filePath) {
  const blobClient = containerClient.getBlockBlobClient(blobName);
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
  const thumbnailName = `${attachmentId}-thumb.png`;
  const blobName = attachmentId + "." + extension;
  await generateThumbnail(filePath, thumbnailName, 480);
  if (isUsingAzureStorage()) {
    await saveToAzure(blobName, mediaType, filePath);
    await saveToAzure(thumbnailName, "image/png", thumbnailName);
    await fsp.unlink(filePath);
    await fsp.unlink(thumbnailName);
    return;
  }
  if (isUsingFtpStorage()) {
    await saveFtp(blobName, filePath);
    await saveFtp(thumbnailName, thumbnailName);
    await fsp.unlink(filePath);
    await fsp.unlink(thumbnailName);
    return;
  }
  // use sftp
  await saveLocally(blobName, filePath);
  await saveLocally(thumbnailName, thumbnailName);
  await fsp.unlink(filePath);
  await fsp.unlink(thumbnailName);
}

async function fetchLocally(fileName) {
  const filePath = path.join(LOCAL_ROOT, fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  } else {
    return await fsp.readFile(filePath);
  }
}

async function fetchFtp(fileName) {
  if (ftpClient.closed) {
    console.log("FTP client is closed");
    try {
      await ftpClient.access({
        host: ftpHost,
        user: ftpUsername,
        password: ftpPassword,
        secure: ftpIsSecure,
        port: ftpPort,
      });
    } catch (err) {
      console.log("[FTPClient] Failed to connect. Exiting...");
      console.log(err);
      return null;
    }
  }

  const writeableStream = new WMStream();
  await ftpClient.downloadTo(writeableStream, fileName);
  return writeableStream.rawBuffer;
}

function fetchFromAzure(fileName) {
  var startDate = new Date();
  startDate.setMinutes(startDate.getMinutes() - 5);
  var expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 60 * 4);

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
  if (isUsingFtpStorage()) {
    return fetchFtp(fileName);
  }
  return await fetchLocally(fileName);
}
