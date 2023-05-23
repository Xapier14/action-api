// packages
import { Router } from "express";

// middlewares
import { mustBeAccessLevel } from "../../../middlewares/authorization.js";

// modules
import {
  incidentNotFound,
  incidentDeleted,
} from "../../../modules/responseGenerator.js";
import logger from "../../../modules/logging.js";

// models
import IncidentSchema from "../../../models/incident.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";
import logging from "../../../modules/logging.js";

const router = Router();
router.use(mustBeAccessLevel(1));
router.delete("/:id", async (req, res) => {
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  IncidentSchema.findById(req.params.id, (err, incident) => {
    if (err) {
      console.log(err);
      incidentNotFound(res, req.params.id);
      logging.log(
        req.ip,
        "Error with database when deleting incident.",
        token,
        "error",
        userId,
        "incident/delete"
      );
      logging.err("Error with database when deleting incident.", err);
    } else {
      incident.remove();
      logger.log(
        req.ip,
        "Incident deleted",
        token,
        "info",
        userId,
        "incident/delete"
      );

      incidentDeleted(res);
    }
  });
});

export default router;
