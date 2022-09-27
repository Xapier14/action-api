import express, { json } from "express";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import readline from "readline";
import { revokeAllCreatedSessions } from "./modules/tokens.js";
import "dotenv/config";
const app = express();

// import routes
import v1 from "./routes/v1.js";

// middlewares
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
app.use(json());
app.use("/api/v1", v1);
app.use("/", express.static("static"));

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
      default:
        console.log("Unknown command");
        break;
    }
  readlineInterface.question("> ", readlineCallback);
};

// mongoose, db init
const port = process.env.PORT || 3000;
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

    // express.js, server init
    app.listen(port, () => {
      // start command loop
      console.log(`chirp-api listening on port ${port}`);
      console.log();
      console.log("Type 'exit' to exit");
      readlineInterface.question("> ", readlineCallback);
    });
  }
);
