import express, { json } from "express";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import cors from "cors";
import readline from "readline";
import bcrypt from "bcrypt";
import "dotenv/config";
import fs from "fs";

import UserSchema from "./models/user.js";

import { useAzureStorage } from "./modules/attachment.js";
import { revokeAllCreatedSessions } from "./modules/tokens.js";
import { clearLocalCache } from "./modules/attachment.js";
import { getFFMPEGVersion, generateThumbnail } from "./modules/ffmpeg.js";
const app = express();

// import routes
import v1 from "./routes/v1.js";

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
      case "exit":
        console.log("Exiting...");
        readlineInterface.close();
        process.exit(0);
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
      // init azure storage
      if (process.env.AZURE_CONNECTION_STRING !== "") {
        console.log("Using Azure blob storage...");
        await useAzureStorage(process.env.AZURE_CONNECTION_STRING);
      } else {
        console.log("Azure blob storage not configured");
      }
      
      // init ffmpeg
      console.log("FFMPEG version: " + await getFFMPEGVersion());
      
      // start command loop
      console.log(`action-api listening on port ${port}`);
      console.log();
      console.log("Type 'exit' to exit");
      readlineInterface.question("", readlineCallback);
    });
  }
);
