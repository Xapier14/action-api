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
    unauthorized(req, res);
    logger.log(
      req.ip,
      `Tried to access protected resource without authorization.`,
      token,
      "warn",
      userId,
      "buildings/fetch"
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
        };
      })
    );
  } catch (err) {
    databaseError(req, res, err);
    return;
  }
});
export default router;
