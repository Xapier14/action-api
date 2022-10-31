// packages
import { Router } from "express";

// middlewares
import { fields } from "../../../middlewares/required.js";

// modules
import { getRequiredFieldsForReport } from "../../../modules/format.js";
import {
  databaseError,
  incidentReportSuccess,
  buildingNotFound,
} from "../../../modules/responseGenerator.js";

// models
import IncidentSchema from "../../../models/incident.js";
import SessionSchema from "../../../models/session.js";
import BuildingSchema from "../../../models/building.js";

const router = Router();

router.use("/", fields(getRequiredFieldsForReport()));
router.post("/", async (req, res) => {
  try {
    const session = await SessionSchema.findOne({
      token: req.headers.authorization,
    });
    try {
      const building = await BuildingSchema.findOne({
        _id: req.body.buildingId,
        location: req.body.location,
      });
      if (!building) {
        buildingNotFound(res, req.body.buildingId);
        return;
      }
    } catch {
      buildingNotFound(res, req.body.buildingId);
      return;
    }
    const severityStatus = Math.max(
      req.body.collapsedStructure ?? 0,
      req.body.leaningOrOutOfPlumb ?? 0,
      req.body.damageToPrimaryStructure ?? 0,
      req.body.fallingHazards ?? 0,
      req.body.groundMovementOrSlope ?? 0,
      req.body.damagedSubmergedFixtures ?? 0,
      req.body.proximityRisk ?? 0
    );
    const incident = await IncidentSchema.create({
      inspectorId: session.userId,
      inspectedDateTime: req.body.inspectedDateTime,
      location: req.body.location,
      buildingId: req.body.buildingId,
      collapsedStructure: req.body.collapsedStructure,
      leaningOrOutOfPlumb: req.body.leaningOrOutOfPlumb,
      damageToPrimaryStructure: req.body.damageToPrimaryStructure,
      fallingHazards: req.body.fallingHazards,
      groundMovementOrSlope: req.body.groundMovementOrSlope,
      damagedSubmergedFixtures: req.body.damagedSubmergedFixtures,
      proximityRiskTitle: req.body.proximityRiskTitle,
      proximityRisk: req.body.proximityRisk,
      evaluationComment: req.body.evaluationComment,
      estimatedBuildingDamage: req.body.estimatedBuildingDamage,
      inspectedPlacard: req.body.inspectedPlacard,
      restrictedPlacard: req.body.restrictedPlacard,
      unsafePlacard: req.body.unsafePlacard,
      barricadeNeeded: req.body.barricadeNeeded,
      barricadeComment: req.body.barricadeComment,
      detailedEvaluationNeeded: req.body.detailedEvaluationNeeded,
      detailedEvaluationAreas: req.body.detailedEvaluationAreas,
      otherRecommendations: req.body.otherRecommendations,
      furtherComments: req.body.furtherComments,
      attachments: req.body.attachments,
      severityStatus: severityStatus,
    });
    incidentReportSuccess(res, req.headers.authorization, incident._id);
  } catch (err) {
    databaseError(req, res, err);
    return;
  }
});

export default router;
