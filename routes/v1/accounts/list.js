// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  databaseError,
  sendAccountList,
} from "../../../modules/responseGenerator.js";
import { verifySession, getUserIdFromToken } from "../../../modules/tokens.js";
import logger from "../../../modules/logging.js";

// models
import UserSchema from "../../../models/user.js";

const router = Router();

router.get("/", async (req, res) => {
  const location = req.query.location;

  const token = req.headers.authorization;

  const accessLevel = (await verifySession(token)) ?? 0;
  const userLocation = await getLocationFromToken(token);

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
          otherInformation: building.otherInformation,
          address: building.address,
          buildingMarshal: building.buildingMarshal,
          storyAboveGround: building.storyAboveGround,
          storyBelowGround: building.storyBelowGround,
          typeOfConstruction: building.typeOfConstruction,
          primaryOccupancy: building.primaryOccupancy,
        };
      })
    );
  } catch (err) {
    databaseError(req, res, err);
    return;
  }
});
export default router;
