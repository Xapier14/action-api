// packages
import { Router } from "express";

// modules
import {
  buildingNotFound,
  buildingDeleted,
} from "../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";
import logging from "../../../modules/logging.js";

// models
import BuildingSchema from "../../../models/building.js";
import IncidentSchema from "../../../models/incident.js";

const router = Router();
router.delete("/:id", async (req, res) => {
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  const building = await BuildingSchema.findById(req.params.id);
  if (building === null) {
    buildingNotFound(res);
    return;
  }
  const incidents = await IncidentSchema.find({ buildingId: building._id });
  incidents.forEach((incident) => {
    incident.remove();
  });
  building.remove();
  buildingDeleted(res);
  logging.log(
    req.ip,
    "Building deleted",
    token,
    "info",
    userId,
    "building/delete"
  );
});

export default router;
