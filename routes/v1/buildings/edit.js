// packages
import { Router } from "express";

// modules
import {
  databaseError,
  buildingEdited,
  buildingNotFound,
  parameterOutOfRange,
  invalidParameter,
} from "../../../modules/responseGenerator.js";

// models
import BuildingSchema from "../../../models/building.js";

const router = Router();

//router.use("/", fields(["name", "location", "maxCapacity"]));
router.post("/", async (req, res) => {
  try {
    const building = await BuildingSchema.findOne({ id });
    if (building === null) {
      buildingNotFound(res, id);
      return;
    }
    if (!req.body.name) return invalidParameter(res, "name");
    if (!req.body.location) return invalidParameter(res, "location");
    if (!req.body.maxCapacity) return invalidParameter(res, "maxCapacity");
    if (!req.body.address) return invalidParameter(res, "address");
    if (!req.body.buildingMarshal)
      return invalidParameter(res, "buildingMarshal");
    if (!req.body.storyAboveGround)
      return invalidParameter(res, "storyAboveGround");
    if (!req.body.storyBelowGround)
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

    if (req.body.maxCapacity < 0 || req.body.maxCapacity > 100000)
      return parameterOutOfRange(res, "maxCapacity", 0, 100000);
    if (req.body.storyAboveGround < 0 || req.body.storyAboveGround > 100)
      return parameterOutOfRange(res, "storyAboveGround", 0, 100);

    building.name = req.body.name;
    building.location = req.body.location;
    building.maxCapacity = req.body.maxCapacity;
    building.otherInformation =
      req.body.otherInformation ?? building.otherInformation;
    building.address = req.body.address;
    building.buildingMarshal = req.body.buildingMarshal;
    building.storyAboveGround = req.body.storyAboveGround;
    building.storyBelowGround = req.body.storyBelowGround;
    building.typeOfConstruction = req.body.typeOfConstruction;
    building.primaryOccupancy = req.body.primaryOccupancy;
    await building.save();
    buildingEdited(res, building._id);
  } catch (err) {
    databaseError(req, res, err);
    return;
  }
});

export default router;
