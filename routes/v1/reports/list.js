import { Router } from "express";

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
} from "../../../modules/tokens.js";

const router = Router();

//router.get("/", mustBeAccessLevel(1));
router.get("/", async (req, res) => {
  const token = req.headers.authorization;
  const accessLevel = (await verifySession(token)) ?? 0;
  const userLocation = await getLocationFromToken(token);
  const limit = Math.min(req.query.limit ?? 10, 100);
  const location =
    accessLevel > 0 ? req.query.location ?? undefined : userLocation;
  const buildingId = req.query.buildingId;
  const severityStatus = req.query.severityStatus;
  const inspectorId = req.params.inspectorId;
  const resolved = req.query.resolved;
  const maxPageOffset = Math.max(
    0,
    Math.floor(
      (await countIncidents(
        location,
        buildingId,
        severityStatus,
        inspectorId,
        resolved
      )) /
        limit -
        1
    )
  );
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
  sendListOfReports(res, token, results, pageOffset, maxPageOffset, limit);
});

// router.get("/:accountId", async (req, res) => {
//   const token = req.headers.authorization;
//   const limit = Math.min(req.query.limit ?? 10, 100);
//   const location = req.query.location;
//   const buildingId = req.query.buildingId;
//   const severityStatus = req.query.severityStatus;
//   const inspectorId = req.params.accountId;
//   const resolved = req.query.resolved;
//   const maxPageOffset = Math.max(
//     0,
//     Math.floor(
//       (await countIncidents(
//         location,
//         buildingId,
//         severityStatus,
//         inspectorId,
//         resolved
//       )) /
//         limit -
//         1
//     )
//   );
//   const pageOffset = Math.min(
//     Math.max(req.query.pageOffset ?? 0, 0),
//     maxPageOffset
//   );
//   const results = await fetchIncidents(
//     true,
//     pageOffset,
//     limit,
//     location,
//     buildingId,
//     severityStatus,
//     inspectorId,
//     resolved
//   );
//   if (results === null) {
//     generalInternalError(req, res);
//     return;
//   }
//   sendListOfReports(res, token, results, pageOffset, maxPageOffset, limit);
// });

export default router;
