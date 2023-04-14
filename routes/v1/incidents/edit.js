import { Router } from "express";

import { fields } from "../../../middlewares/required.js";

import {
  databaseError,
  unauthorized,
  incidentNotFound,
} from "../../../modules/responseGenerator.js";
import {
  verifySession,
  getUserIdFromToken,
  getLocationFromToken,
} from "../../../modules/tokens.js";
import logger from "../../../modules/logging.js";

import IncidentSchema from "../../../models/incident.js";
import { mustBeAccessLevel } from "../../../middlewares/authorization.js";

const router = Router();

router.use(mustBeAccessLevel(1));
router.patch("/", (req, res) => {
  unauthorized(res);
});

router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) {
    unauthorized(res);
    return;
  }
  try {
    const incident = await IncidentSchema.findById(id);
    if (!incident) {
      incidentNotFound(res, id);
      return;
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
        "incidents/edit"
      );
      return;
    }
    const {
      inspectorId,
      inspectedDateTime,
      location,
      buildingId,
      areasInspected,
      collapsedStructure,
      leaningOrOutOfPlumb,
      damageToPrimaryStructure,
      fallingHazards,
      groundMovementOrSlope,
      damagedSubmergedFixtures,
      proximityRiskTitle,
      proximityRisk,
      evaluationComment,
      estimatedBuildingDamage,
      inspectedPlacard,
      restrictedPlacard,
      unsafePlacard,
      barricadeNeeded,
      barricadeComment,
      detailedEvaluationNeeded,
      detailedEvaluationAreas,
      otherRecommendations,
      furtherComments,
      attachments,
      resolved,
      severityStatus,
    } = req.body;
    if (inspectorId) incident.inspectorId = inspectorId;
    if (inspectedDateTime) incident.inspectedDateTime = inspectedDateTime;
    if (location) incident.location = location;
    if (buildingId) incident.buildingId = buildingId;
    if (areasInspected) incident.areasInspected = areasInspected;
    if (collapsedStructure) incident.collapsedStructure = collapsedStructure;
    if (leaningOrOutOfPlumb) incident.leaningOrOutOfPlumb = leaningOrOutOfPlumb;
    if (damageToPrimaryStructure)
      incident.damageToPrimaryStructure = damageToPrimaryStructure;
    if (fallingHazards) incident.fallingHazards = fallingHazards;
    if (groundMovementOrSlope)
      incident.groundMovementOrSlope = groundMovementOrSlope;
    if (damagedSubmergedFixtures)
      incident.damagedSubmergedFixtures = damagedSubmergedFixtures;
    if (proximityRiskTitle) incident.proximityRiskTitle = proximityRiskTitle;
    if (proximityRisk) incident.proximityRisk = proximityRisk;
    if (evaluationComment) incident.evaluationComment = evaluationComment;
    if (estimatedBuildingDamage)
      incident.estimatedBuildingDamage = estimatedBuildingDamage;
    if (inspectedPlacard) incident.inspectedPlacard = inspectedPlacard;
    if (restrictedPlacard) incident.restrictedPlacard = restrictedPlacard;
    if (unsafePlacard) incident.unsafePlacard = unsafePlacard;
    if (barricadeNeeded) incident.barricadeNeeded = barricadeNeeded;
    if (barricadeComment) incident.barricadeComment = barricadeComment;
    if (detailedEvaluationNeeded)
      incident.detailedEvaluationNeeded = detailedEvaluationNeeded;
    if (detailedEvaluationAreas) {
      const detailedEvaluationAreasData = detailedEvaluationAreas.split(",");
      incident.detailedEvaluationAreas = detailedEvaluationAreasData;
    }
    if (otherRecommendations)
      incident.otherRecommendations = otherRecommendations;
    if (furtherComments) incident.furtherComments = furtherComments;
    if (attachments) {
      const attachmentsData = attachments.split(",");
      incident.attachments = attachmentsData;
    }
    if (resolved) incident.resolved = resolved;
    if (severityStatus) incident.severityStatus = severityStatus;
    await incident.save();
  } catch (err) {
    databaseError(req, res, err);
    return;
  }
});

export default router;
