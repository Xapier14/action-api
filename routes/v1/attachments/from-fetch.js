// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  incidentNotFound,
} from "../../../modules/responseGenerator.js";

// models
import IncidentSchema from "../../../models/incident.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:id", async (req, res) => {
  const incidentId = req.params.id;
  // get incident
  let incident;
  try {
    incident = await IncidentSchema.findOne({ _id: incidentId });
    if (!incident) {
      return incidentNotFound(res, incidentId);
    }
  } catch (err) {
    return incidentNotFound(res, incidentId);
  }

  // get attachments
  const attachments = incident.attachments;
  res.send(attachments);
});

export default router;
