// packages
import { Router } from "express";

// modules
import {
  databaseError,
  buildingAdded,
  parameterOutOfRange,
  invalidParameter,
} from "../../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../../modules/tokens.js";

// models
import BuildingSchema from "../../../../models/building.js";
import logging from "../../../../modules/logging.js";

const router = Router();

router.post("/:building", async (req, res) => {
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  const building = req.params.building;

  try {
    if (!req.body.name) return invalidParameter(res, "name");
    if (!req.body.location) return invalidParameter(res, "location");
    if (req.body.maxCapacity === undefined)
      return invalidParameter(res, "maxCapacity");
    if (!req.body.address) return invalidParameter(res, "address");
    if (!req.body.buildingMarshal)
      return invalidParameter(res, "buildingMarshal");
    if (req.body.storyAboveGround === undefined)
      return invalidParameter(res, "storyAboveGround");
    if (req.body.storyBelowGround === undefined)
      return invalidParameter(res, "storyBelowGround");
    if (!req.body.typeOfConstruction)
      return invalidParameter(res, "typeOfConstruction");
    if (!req.body.primaryOccupancy)
      return invalidParameter(res, "primaryOccupancy");
    if (isNaN(req.body.maxCapacity))
      return invalidParameter(res, "maxCapacity");
    if (isNaN(req.body.storyAboveGround))
      return invalidParameter(res, "storyAboveGround");
    if (isNaN(req.body.storyBelowGround))
      return invalidParameter(res, "storyBelowGround");

    if (req.body.maxCapacity < 0 || req.body.maxCapacity > 1000000)
      return parameterOutOfRange(res, "maxCapacity", 0, 100000);
    if (req.body.storyAboveGround < 0 || req.body.storyAboveGround > 1000000)
      return parameterOutOfRange(res, "storyAboveGround", 0, 1000000);

    const building = await BuildingSchema.create({
      name: req.body.name,
      location: req.body.location,
      maxCapacity: Number(req.body.maxCapacity),
      otherInformation: req.body.otherInformation ?? "-n/a-",
      address: req.body.address,
      buildingMarshal: req.body.buildingMarshal,
      storyAboveGround: Number(req.body.storyAboveGround),
      storyBelowGround: Number(req.body.storyBelowGround),
      typeOfConstruction: req.body.typeOfConstruction,
      primaryOccupancy: req.body.primaryOccupancy,
    });
    buildingAdded(res, building._id);
    logging.log(
      req.ip,
      `Building ${building._id} added.`,
      token,
      "info",
      userId,
      "addBuilding"
    );
  } catch (err) {
    databaseError(req, res, err);
    logging.log(
      req.ip,
      `Building ${building._id} failed to add item in inventory.`,
      token,
      "error",
      userId,
      "addInventoryItem"
    );
    logging.err("Building.Add", err);
    return;
  }
});

export default router;
