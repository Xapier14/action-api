// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  buildingNotFound,
  buildingFound,
} from "../../../modules/responseGenerator.js";
import {
  getLocationFromToken,
  verifySession,
  getUserIdFromToken,
} from "../../../modules/tokens.js";
import logger from "../../../modules/logging.js";

// models
import BuildingSchema from "../../../models/building.js";
import IncidentSchema from "../../../models/incident.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const token = req.headers.authorization;
  // get building
  try {
    const building = await BuildingSchema.findOne({ _id: id });
    if (building === null) {
      buildingNotFound(res, id);
      return;
    }

    const userLocation = await getLocationFromToken(token);
    const userId = await getUserIdFromToken(token);
    const accessLevel = (await verifySession(token)) ?? 0;
    if (accessLevel < 1 && building.location !== userLocation) {
      unauthorized(res);
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

    // get last incident for building
    try {
      const incident = await IncidentSchema.findOne({ buildingId: id }).sort({
        inspectedDateTime: -1,
      });
      const lastInspection =
        incident === null ? null : incident.inspectedDateTime;
      const lastStatus = incident === null ? 0 : incident.severityStatus;

      // send building
      buildingFound(res, {
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
        inventoryCount: building.inventory?.length ?? 0,
        lastStatus: lastStatus,
        lastInspection: lastInspection,
        lastIncidentId: incident.id,
      });
    } catch {
      buildingFound(res, {
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
        inventoryCount: building.inventory?.length ?? 0,
      });
    }
  } catch {
    buildingNotFound(res, id);
  }
});

export default router;
