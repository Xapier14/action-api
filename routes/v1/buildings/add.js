// packages
import { Router } from "express";

// middlewares
import { fields } from "../../../middlewares/required.js";

// modules
import {
  databaseError,
  buildingAdded,
} from "../../../modules/responseGenerator.js";

// models
import BuildingSchema from "../../../models/building.js";

const router = Router();

//router.use("/", fields(["name", "location", "maxCapacity"]));
router.post("/", async (req, res) => {
  try {
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
