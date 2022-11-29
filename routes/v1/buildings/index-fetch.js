// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  buildingNotFound,
  buildingFound,
} from "../../../modules/responseGenerator.js";

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
      });
    }
  } catch {
    buildingNotFound(res, id);
  }
});

export default router;
