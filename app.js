import express, { json } from "express";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import cors from "cors";
import readline from "readline";
import bcrypt from "bcrypt";
import "dotenv/config";
import fs from "fs";
import logging from "./modules/logging.js";

import UserSchema from "./models/user.js";

import {
  isUsingAwsS3,
  isUsingAzureStorage,
  isUsingFtpStorage,
  useAwsStorage,
  useAzureStorage,
  useFtpStorage,
} from "./modules/attachment.js";
import { revokeAllCreatedSessions } from "./modules/tokens.js";
import { clearLocalCache } from "./modules/attachment.js";
import { getFFMPEGVersion } from "./modules/ffmpeg.js";
const app = express();

// import routes
import v1 from "./routes/v1.js";
import { useRecaptcha } from "./modules/recaptcha.js";

// middlewares
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(json());
app.use("/api/v1", v1);
app.use("/", express.static("static"));

app.set("trust proxy", true);

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// command loop
const readlineCallback = function (line) {
  if (line !== "")
    switch (line) {
      case "help":
        console.log("Available commands:");
        console.log("help\t\t\t- Displays available commands");
        console.log("revoke\t\t\t- Revokes all sessions");
        console.log("deleteAttachments\t- Deletes all attachments");
        console.log("clearUploadCache\t- Clears the upload cache [Deprecated]");
        console.log();
        break;
      case "revoke":
        console.log("Revoking all sessions...");
        revokeAllCreatedSessions();
        break;
      case "deleteAttachments":
        console.log("Deleting all attachments...");
        break;
      case "clearUploadCache":
        console.log("Clearing upload cache...");
        clearLocalCache();
        break;
      case "exit":
        console.log("Exiting...");
        readlineInterface.close();
        process.exit(0);
      default:
        console.log("Unknown command");
        break;
    }
  readlineInterface.question("", readlineCallback);
};

if (!fs.existsSync("./localUploadCache")) {
  fs.mkdirSync("./localUploadCache");
}
if (!fs.existsSync("./attachments")) {
  fs.mkdirSync("./attachments");
}

// mongoose, db init
const port = process.env.PORT || 3000;
const siteKey = process.env.RECAPTCHA_SITE_KEY ?? "";
const apiKey = process.env.GOOGLE_CLOUD_API_KEY ?? "";
const googleCloudProjectId = process.env.GOOGLE_CLOUD_PROJECT_ID ?? "";

mongoose.set("strictQuery", false);
mongoose.connect(
  process.env.DB_CONNECTION,
  {
    useNewUrlParser: true,
  },
  (err) => {
    if (err) {
      console.log("Error connecting to the database!");
      console.log(err);
      return;
    }
    console.log("Connected to DB");

    // check if admin account exists
    UserSchema.findOne({ email: "admin@g.batstate-u.edu.ph" }, (err, user) => {
      if (err) {
        console.log("Error checking for admin account");
        console.log(err);
        return;
      }
      if (user === null) {
        const admin = new UserSchema({
          email: "admin@g.batstate-u.edu.ph",
          password: bcrypt.hashSync("Admin123", 10),
          maxAccessLevel: 1,
          firstName: "Admin",
          lastName: "Account",
          location: "HQ",
        });
        admin.save((err) => {
          if (err) {
            console.log("Error creating admin account");
            console.log(err);
            return;
          }
        });
      }
    });

    // express.js, server init
    app.listen(port, async () => {
      // generate instance id
      const instanceId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const envConfig = process.env.ENV_CONFIG ?? "production";
      logging.log(
        "n/a",
        `[${instanceId}] Instance started initialization routine. (config: ${envConfig})`,
        "",
        "system",
        "",
        "init"
      );

      // init azure storage
      if (process.env.AZURE_CONNECTION_STRING !== "") {
        console.log("Configuring Azure blob storage...");
        await useAzureStorage(process.env.AZURE_CONNECTION_STRING);
      } else {
        console.log("Azure blob storage not configured.");
      }

      if (
        process.env.AWS_ACCESS_KEY_ID !== "" &&
        process.env.AWS_SECRET_ACCESS_KEY !== ""
      ) {
        const region = process.env.AWS_REGION ?? "us-east-1";
        const bucketName = process.env.AWS_BUCKET_NAME ?? "g-batstate-u-action";
        console.log(
          `Configuring AWS S3 (region: ${region}, bucket: ${bucketName})...`
        );
        await useAwsStorage(region, bucketName);
      } else {
        console.log("AWS S3 not configured.");
      }

      // init ftp storage
      if (
        process.env.AZURE_CONNECTION_STRING === "" &&
        process.env.FTP_CONNECTION_STRING !== ""
      ) {
        console.log("Configuring FTP for storage...");
        await useFtpStorage(process.env.FTP_CONNECTION_STRING);
      } else {
        console.log("FTP storage not configured.");
      }

      if (!isUsingAzureStorage() && !isUsingAwsS3() && !isUsingFtpStorage()) {
        console.log("Storage not configured");
        console.log("Using local cache.");
        console.warn(
          "Warning. This may be a problem for containerized deployments."
        );
      }

      useRecaptcha(siteKey, apiKey, googleCloudProjectId);

      // init ffmpeg
      const ffmpegVersion = await getFFMPEGVersion();
      console.log("FFMPEG version: " + ffmpegVersion);
      logging.log(
        "n/a",
        `[${instanceId}] FFMPEG: ${ffmpegVersion}`,
        "",
        "system",
        "",
        "init"
      );

      // start command loop
      console.log(`action-api listening on port ${port}`);
      logging.log(
        "n/a",
        `[${instanceId}] Instance initialized`,
        "",
        "system",
        "",
        "init"
      );
      console.log();
      console.log("Type 'exit' to exit");
      readlineInterface.question("", readlineCallback);
    });
  }
);
