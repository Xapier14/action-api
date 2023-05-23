// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  databaseError,
  sendReportsCount,
} from "../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";
import logging from "../../../modules/logging.js";

// models
import IncidentSchema from "../../../models/incident.js";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  const location = req.query.location;
  const building = req.query.building;
  if (location == unauthorized) {
    return unauthorized(res);
  }
  // get users
  try {
    const query = {
      location: location,
    };
    if (building) {
      query.buildingId = building;
    }
    // count in db
    const count = await IncidentSchema.countDocuments(query);
    sendReportsCount(res, count, location, building ?? undefined);
  } catch (err) {
    databaseError(req, res, err);
    logging.log(
      req.ip,
      "Error with database when fetching report count.",
      token,
      "error",
      userId,
      "reports/count"
    );
    logging.err("Reports.Count", err);
    return;
  }
});
export default router;
