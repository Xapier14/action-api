// packages
import { Router } from "express";

// modules
import {
  buildingNotFound,
  buildingDeleted,
} from "../../../modules/responseGenerator.js";

// models
import BuildingSchema from "../../../models/building.js";
import IncidentSchema from "../../../models/incident.js";

const router = Router();
router.delete("/:id", async (req, res) => {
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
});

export default router;
