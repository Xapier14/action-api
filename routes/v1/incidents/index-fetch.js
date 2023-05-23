// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  incidentNotFound,
  incidentFound,
} from "../../../modules/responseGenerator.js";
import {
  getUserIdFromToken,
  getLocationFromToken,
  verifySession,
} from "../../../modules/tokens.js";

// models
import IncidentSchema from "../../../models/incident.js";
import logging from "../../../modules/logging.js";

const router = Router();
router.get("/:id", async (req, res) => {
  const reportId = req.params.id;
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  // get incident
  try {
    const incident = await IncidentSchema.findOne({ _id: reportId });
    if (incident === null) {
      incidentNotFound(res, reportId);
      return;
    }

    const accessLevel = (await verifySession(token)) ?? 0;
    const userLocation = await getLocationFromToken(token);

    if (incident.location != userLocation && accessLevel < 1) {
      unauthorized(res);
      logger.log(
        req.ip,
        `Tried to access protected resource without authorization.`,
        token,
        "warn",
        userId,
        "incidents/fetch"
      );
      return;
    }

    // send
    incidentFound(res, {
      id: incident.id,
      inspectorId: incident.inspectorId,
      inspectedDateTime: incident.inspectedDateTime,
      location: incident.location,
      buildingId: incident.buildingId,
      areasInspected: incident.areasInspected,
      collapsedStructure: incident.collapsedStructure,
      leaningOrOutOfPlumb: incident.leaningOrOutOfPlumb,
      damageToPrimaryStructure: incident.damageToPrimaryStructure,
      fallingHazards: incident.fallingHazards,
      groundMovementOrSlope: incident.groundMovementOrSlope,
      damagedSubmergedFixtures: incident.damagedSubmergedFixtures,
      proximityRiskTitle: incident.proximityRiskTitle,
      proximityRisk: incident.proximityRisk,
      evaluationComment: incident.evaluationComment,
      estimatedBuildingDamage: incident.estimatedBuildingDamage,
      inspectedPlacard: incident.inspectedPlacard,
      restrictedPlacard: incident.restrictedPlacard,
      unsafePlacard: incident.unsafePlacard,
      doNotEnter: incident.doNotEnter,
      briefEntryAllowed: incident.briefEntryAllowed,
      doNotUse: incident.doNotUse,
      otherRestrictions: incident.otherRestrictions,
      barricadeComment: incident.barricadeComment,
      detailedEvaluationAreas: removeItemFromArray(
        incident.detailedEvaluationAreas,
        ""
      ),
      otherRecommendations: incident.otherRecommendations,
      furtherComments: incident.furtherComments,
      attachments: incident.attachments,
      resolved: incident.resolved,
      severityStatus: incident.severityStatus,
    });
  } catch (err) {
    incidentNotFound(res, reportId);
    logging.log(
      req.ip,
      `Failed to fetch incident ${reportId}.`,
      token,
      "error",
      userId,
      "incidents/fetch"
    );
    logging.err("Incident.Fetch", err);
  }
});

function removeItemFromArray(array, item) {
  // make copy
  const copy = [...array];
  const index = copy.indexOf(item);
  if (index > -1) {
    copy.splice(index, 1);
  }
  return copy;
}

export default router;
