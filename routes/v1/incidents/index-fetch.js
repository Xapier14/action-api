// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  incidentNotFound,
  incidentFound,
} from "../../../modules/responseGenerator.js";

// models
import IncidentSchema from "../../../models/incident.js";

const router = Router();

router.get("/", (req, res) => {
  unauthorized(res);
});

router.get("/:id", async (req, res) => {
  const reportId = req.params.id;
  // get incident
  try {
    const incident = await IncidentSchema.findOne({ _id: reportId });
    if (incident === null) {
      incidentNotFound(res, reportId);
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
      detailedEvaluationAreas: incident.detailedEvaluationAreas,
      otherRecommendations: incident.otherRecommendations,
      furtherComments: incident.furtherComments,
      attachments: incident.attachments,
      resolved: incident.resolved,
      severityStatus: incident.severityStatus,
    });
  } catch (err) {
    console.log(err);
    incidentNotFound(res, reportId);
  }
});

export default router;
