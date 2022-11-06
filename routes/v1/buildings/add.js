// packages
import { Router } from "express";

// modules
import {
  databaseError,
  buildingAdded,
  parameterOutOfRange,
  invalidParameter,
} from "../../../modules/responseGenerator.js";

// models
import BuildingSchema from "../../../models/building.js";

const router = Router();

//router.use("/", fields(["name", "location", "maxCapacity"]));
router.post("/", async (req, res) => {
  try {
    if (!req.body.name) return invalidParameter(res, "name");
    if (!req.body.location) return invalidParameter(res, "location");
    if (!req.body.maxCapacity) return invalidParameter(res, "maxCapacity");
    if (req.body.maxCapacity < 0 || req.body.maxCapacity > 100000)
      return parameterOutOfRange(res, "maxCapacity", 0, 100000);

    const building = await BuildingSchema.create({
      name: req.body.name,
      location: req.body.location,
      maxCapacity: req.body.maxCapacity,
    });
    buildingAdded(res, building._id);
  } catch (err) {
    databaseError(req, res, err);
    return;
  }
});

export default router;
