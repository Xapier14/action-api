import { Router } from "express";

import { mustBeAccessLevel } from "../../../middlewares/authorization.js";
import { fields } from "../../../middlewares/required.js";

import { fetchIncidents } from "../../../modules/incidentModularFetch.js";
import {
  sendListOfReports,
  generalInternalError,
} from "../../../modules/responseGenerator.js";

const router = Router();

router.get("/", mustBeAccessLevel(1));
router.get("/", async (req, res) => {
  const token = req.headers.authorization;
  const limit = req.query.limit;
  const pageOffset = req.query.pageOffset;
  const location = req.query.location;
  const buildingId = req.query.buildingId;
  const severityStatus = req.query.severityStatus;
  const results = await fetchIncidents(
    pageOffset,
    limit,
    location,
    buildingId,
    severityStatus,
    null
  );
  if (results === null) {
    generalInternalError(req, res);
    return;
  }
  sendListOfReports(res, token, results, pageOffset, limit);
});

router.get("/:accountId", async (req, res) => {
  const token = req.headers.authorization;
  const limit = Math.min(req.query.limit ?? 10, 100);
  const pageOffset = Math.max(req.query.pageOffset ?? 1, 1);
  const location = req.query.location;
  const buildingId = req.query.buildingId;
  const severityStatus = req.query.severityStatus;
  const inspectorId = req.query.inspectorId;
  const results = await fetchIncidents(
    pageOffset,
    limit,
    location,
    buildingId,
    severityStatus,
    inspectorId
  );
  if (results === null) {
    generalInternalError(req, res);
    return;
  }
  sendListOfReports(res, token, results, pageOffset, limit);
});

export default router;
