import { Router } from "express";

import { fields } from "../../../middlewares/required.js";

import {
  databaseError,
  unauthorized,
  incidentNotFound,
  incidentEditSuccess,
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
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(req.headers.authorization);
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
      doNotEnter,
      briefEntryAllowed,
      doNotUse,
      otherRestrictions,
      barricadeNeeded,
      barricadeComment,
      detailedEvaluationAreas,
      otherRecommendations,
      furtherComments,
      attachments,
      resolved,
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
    if (doNotEnter) incident.doNotEnter = doNotEnter;
    if (briefEntryAllowed) incident.briefEntryAllowed = briefEntryAllowed;
    if (doNotUse) incident.doNotUse = doNotUse;
    if (otherRestrictions) incident.otherRestrictions = otherRestrictions;
    console.log(incident.otherRestrictions);
    if (barricadeNeeded) incident.barricadeNeeded = barricadeNeeded;
    if (barricadeComment) incident.barricadeComment = barricadeComment;
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
    const average =
      (req.body.collapsedStructure ?? 0) / 3 +
      (req.body.leaningOrOutOfPlumb ?? 0) / 3 +
      (req.body.damageToPrimaryStructure ?? 0) / 3 +
      (req.body.fallingHazards ?? 0) / 3 +
      (req.body.groundMovementOrSlope ?? 0) / 3 +
      (req.body.damagedSubmergedFixtures ?? 0) / 3 +
      (req.body.proximityRisk ?? 0) / 3;
    const baseSeverityStatus = average > 0 ? average / 7 : 0;
    const severityStatus = Math.min(
      1,
      (baseSeverityStatus * 2 + (req.body.estimatedBuildingDamage / 5) * 4) / 4
    );
    incident.severityStatus = Math.round(severityStatus * 3);
    await incident.save();
    incidentEditSuccess(res, token, incident.id);
    logger.log(
      req.ip,
      `Edited incident ${incident.id}.`,
      req.headers.authorization,
      "info",
      userId,
      "incidents/edit"
    );
  } catch (err) {
    databaseError(req, res, err);
    logger.log(
      req.ip,
      `Failed to edit incident ${id}.`,
      req.headers.authorization,
      "error",
      null,
      "incidents/edit"
    );
    logging.err("Incidents.Edit", err);
    return;
  }
});

export default router;
