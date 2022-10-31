// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  databaseError,
  sendBuildingList,
} from "../../../modules/responseGenerator.js";

// models
import BuildingSchema from "../../../models/building.js";

const router = Router();

router.get("/", async (req, res) => {
  const location = req.query.location;
  // get buildings
  try {
    const query = {};
    if (location) {
      query.location = location;
    }
    const buildings = await BuildingSchema.find(query);
    sendBuildingList(
      res,
      location ?? "all",
      buildings.map((building) => {
        return {
          id: building._id,
          name: building.name,
          location: building.location,
          maxCapacity: building.maxCapacity,
        };
      })
    );
  } catch (err) {
    databaseError(req, res, err);
    return;
  }
});
export default router;
