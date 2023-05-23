import { Router } from "express";

import { searchResults } from "../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";
import logging from "../../../modules/logging.js";

import UserSchema from "../../../models/user.js";
import BuildingSchema from "../../../models/building.js";

const router = Router();

router.get("/", async (req, res) => {
  const startTime = Date.now();
  const query = req.query.q ?? req.query.query;
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  let regex = new RegExp(query, "i");

  let usersQuery = {};
  // full name or email
  usersQuery.$expr = {
    $or: [
      { $regexMatch: { input: "$firstName", regex: query, options: "i" } },
      { $regexMatch: { input: "$lastName", regex: query, options: "i" } },
      { $regexMatch: { input: "$email", regex: query, options: "i" } },
      {
        $regexMatch: {
          input: {
            $concat: ["$firstName", " ", "$lastName"],
          },
          regex: query,
          options: "i",
        },
      },
    ],
  };

  let users = await UserSchema.find(usersQuery);
  try {
    let buildings = await BuildingSchema.find({
      $or: [{ name: regex }, { address: regex }, { buildingMarshal: regex }],
    });
    let simplifiedUsers = users.map((user) => {
      return {
        id: user._id,
        fullName: user.firstName + " " + user.lastName,
        location: user.location,
        email: user.email,
      };
    });
    let simplifiedBuildings = buildings.map((building) => {
      return {
        id: building._id,
        name: building.name,
        location: building.location,
        address: building.address,
        buildingMarshal: building.buildingMarshal,
      };
    });
    const searchTime = Date.now() - startTime;
    return searchResults(
      res,
      query,
      simplifiedUsers,
      simplifiedBuildings,
      searchTime
    );
  } catch (err) {
    const searchTime = Date.now() - startTime;
    logging.log(
      req.ip,
      `Error while searching: ${err}`,
      token,
      "error",
      userId,
      "misc/search"
    );
    logging.err("Search", err);
    return searchResults(res, query, [], [], searchTime);
  }
});

export default router;
