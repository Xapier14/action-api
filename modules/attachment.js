/*
 * attachment.js - Service Module
 *
 * Handles uploading and fetching attachments.
 * Supports Azure Blob Storage, AWS S3, FTP, and local storage.
 *
 * Requires 'ffmpeg.js' and 'wmStream.js'
 *
 * Copyright © 2023 Lance Crisang (Xapier14)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Azure Blob Storage
import azure from "azure-storage";
import { BlobServiceClient } from "@azure/storage-blob";

// AWS S3
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  paginateListObjectsV2,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fromEnv } from "@aws-sdk/credential-providers";

// FTP
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

// AWS S3
let s3Client = null;
let s3Bucket = null;
let s3Region = null;

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

export async function useAwsStorage(region, bucketName) {
  if (s3Client !== null) {
    console.log("AWS S3 storage already in use");
    return;
  }
  s3Client = new S3Client({
    credentials: fromEnv(),
    region: region,
  });
  s3Region = region;
  s3Bucket = bucketName;
  try {
    const response = await s3Client.send(
      new CreateBucketCommand({ Bucket: bucketName })
    );
    console.log("Bucket created: ", response);
  } catch (err) {
    if (err.name == undefined) {
      console.log("Error creating bucket: ", err);
      s3Client.destroy();
      s3Client = null;
      s3Region = null;
      return;
    }
    if (err.name == "BucketAlreadyOwnedByYou") {
      console.log("Bucket exists and is owned by you.");
    } else if (err.name == "BucketAlreadyExists") {
      console.log("Bucket exists and is owned by another account.");
      s3Client.destroy();
      s3Client = null;
      s3Region = null;
      return;
    } else {
      console.log("Error creating bucket: ", err.name);
      s3Client.destroy();
      s3Client = null;
      s3Region = null;
      return;
    }
  }
  console.log("AWS S3 configured successfully.");
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

export function isUsingAwsS3() {
  return s3Client !== null && s3Region !== null && s3Bucket !== null;
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

function deleteFromAwsS3(attachmentId, extension) {
  const fileName = attachmentId + "." + extension;
  const command = new DeleteObjectCommand({
    Bucket: s3Bucket,
    Key: fileName,
  });
  s3Client.send(command);
}

export function deleteAttachment(attachmentId, extension) {
  if (isUsingAzureStorage()) {
    deleteFromAzure(attachmentId, extension);
    deleteFromAzure(`${attachmentId}-thumb`, extension);
    return;
  }
  if (isUsingAwsS3()) {
    deleteFromAwsS3(attachmentId, extension);
    deleteFromAwsS3(`${attachmentId}-thumb`, extension);
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

function saveLocally(fileName, filePath) {
  const localPath = LOCAL_ROOT + fileName;

  const readStream = fs.createReadStream(filePath);
  const writeStream = fs.createWriteStream(localPath);
  return readStream.pipe(writeStream);
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

async function saveToAwsS3(fileName, mediaType, filePath) {
  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: fileName,
    Body: fs.readFileSync(filePath),
    ContentType: mediaType,
  });
  await s3Client.send(command);
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
  if (isUsingAwsS3()) {
    await saveToAwsS3(blobName, mediaType, filePath);
    await saveToAwsS3(thumbnailName, "image/png", thumbnailName);
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
  saveLocally(blobName, filePath).on("finish", async () => {
    await fsp.unlink(filePath);
  });
  saveLocally(thumbnailName, thumbnailName).on("finish", async () => {
    await fsp.unlink(thumbnailName);
  });
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

async function fetchFromAwsS3(fileName) {
  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: fileName,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 4 });
  return url;
}

export async function fetchAttachment(fileName) {
  if (isUsingAzureStorage()) {
    return fetchFromAzure(fileName);
  }
  if (isUsingAwsS3()) {
    return fetchFromAwsS3(fileName);
  }
  if (isUsingFtpStorage()) {
    return fetchFtp(fileName);
  }
  return await fetchLocally(fileName);
}
