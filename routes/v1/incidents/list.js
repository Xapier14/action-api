// packages
import { Router } from "express";

// middlewares
import { mustBeAccessLevel } from "../../../middlewares/authorization.js";

// modules
import {
  fetchIncidents,
  countIncidents,
} from "../../../modules/incidentModularFetch.js";
import {
  sendListOfReports,
  generalInternalError,
} from "../../../modules/responseGenerator.js";
import {
  getLocationFromToken,
  verifySession,
  getUserIdFromToken,
} from "../../../modules/tokens.js";

const router = Router();

//router.get("/", mustBeAccessLevel(1));
router.get("/", async (req, res) => {
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);

  const accessLevel = (await verifySession(token)) ?? 0;
  const userLocation = await getLocationFromToken(token);
  const limit = Math.min(req.query.limit ?? 10, 100);
  const location =
    accessLevel > 0 ? req.query.location ?? undefined : userLocation;
  const buildingId = req.query.buildingId;
  const severityStatus = req.query.severityStatus;
  const inspectorId = accessLevel > 0 ? req.query.inspectorId : undefined;
  const resolved = req.query.resolved;
  const totalReportCount = await countIncidents(
    location,
    buildingId,
    severityStatus,
    inspectorId,
    resolved
  );
  const maxPageOffset = Math.max(0, Math.ceil(totalReportCount / limit - 1));
  const pageOffset = Math.min(
    Math.max(req.query.pageOffset ?? 0, 0),
    maxPageOffset
  );
  const results = await fetchIncidents(
    true,
    pageOffset,
    limit,
    location,
    buildingId,
    severityStatus,
    inspectorId,
    resolved
  );
  if (results === null) {
    generalInternalError(req, res);
    return;
  }
  sendListOfReports(
    res,
    token,
    results,
    pageOffset,
    maxPageOffset,
    limit,
    totalReportCount
  );
});

export default router;
