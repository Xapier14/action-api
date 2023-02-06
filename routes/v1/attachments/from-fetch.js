/*
 * GET /from/{:reportId}
 *   required parameters: reportId
 *   response:
 *    - 401: unauthorized (e: 7)
 *    - 404: incident not found (e: 12)
 */

// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  incidentNotFound,
} from "../../../modules/responseGenerator.js";
import {
  verifySession,
  getLocationFromToken,
  getUserIdFromToken,
} from "../../../modules/tokens.js";
import logger from "../../../modules/logging.js";

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

  const userLocation = await getLocationFromToken(req.headers.authorization);
  const userId = await getUserIdFromToken(req.headers.authorization);
  const accessLevel = (await verifySession(req.headers.authorization)) ?? 0;
  if (accessLevel < 1 && incident.location !== userLocation) {
    unauthorized(res);
    logger.log(
      req.ip,
      `Tried to access protected resource without authorization.`,
      req.headers.authorization,
      "warn",
      userId,
      "attachments/from-fetch"
    );
    return;
  }

  // get attachments
  const attachments = incident.attachments;
  res.send(attachments);
});

export default router;
