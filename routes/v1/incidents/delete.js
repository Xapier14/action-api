// packages
import { Router } from "express";

// middlewares
import { mustBeAccessLevel } from "../../../middlewares/authorization.js";

// modules
import {
  incidentNotFound,
  incidentDeleted,
} from "../../../modules/responseGenerator.js";

// models
import IncidentSchema from "../../../models/incident.js";

const router = Router();
router.use(mustBeAccessLevel(1));
router.delete("/:id", async (req, res) => {
  IncidentSchema.findById(req.params.id, (err, incident) => {
    if (err) {
      console.log(err);
      incidentNotFound(res, req.params.id);
    } else {
      incident.remove();
      incidentDeleted(res);
    }
  });
});

export default router;
