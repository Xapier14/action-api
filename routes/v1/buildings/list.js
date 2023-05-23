// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  databaseError,
  sendBuildingList,
} from "../../../modules/responseGenerator.js";
import {
  getLocationFromToken,
  verifySession,
  getUserIdFromToken,
} from "../../../modules/tokens.js";
import logger from "../../../modules/logging.js";

// models
import BuildingSchema from "../../../models/building.js";

const router = Router();

router.get("/", async (req, res) => {
  const location = req.query.location;

  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);

  const accessLevel = (await verifySession(token)) ?? 0;
  const userLocation = await getLocationFromToken(token);

  if (location != userLocation && accessLevel < 1) {
    unauthorized(res);
    logger.log(
      req.ip,
      `Tried to access protected resource without authorization.`,
      token,
      "warn",
      userId,
      "buildings/list"
    );
    return;
  }

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
    logger.log(
      req.ip,
      `Error while fetching buildings: ${err}`,
      token,
      "error",
      userId,
      "buildings/list"
    );
    logger.err("Buildings.List", err);
    return;
  }
});
export default router;
