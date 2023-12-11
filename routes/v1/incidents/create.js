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
  unauthorized,
} from "../../../modules/responseGenerator.js";
import { getLocationFromToken } from "../../../modules/tokens.js";
import logger from "../../../modules/logging.js";
import { getUserIdFromToken } from "../../../modules/tokens.js";
import {
  requireLicenseValid,
  requireLicensePresent,
} from "../../../middlewares/licensing.js";

// models
import AttachmentSchema from "../../../models/attachment.js";
import IncidentSchema from "../../../models/incident.js";
import SessionSchema from "../../../models/session.js";
import BuildingSchema from "../../../models/building.js";
import logging from "../../../modules/logging.js";

const router = Router();

router.use(requireLicensePresent);
router.use(requireLicenseValid);
router.use("/", fields(getRequiredFieldsForReport()));
router.post("/", async (req, res) => {
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  try {
    const session = await SessionSchema.findOne({
      token: req.headers.authorization,
    });
    const userLocation = await getLocationFromToken(req.headers.authorization);
    if (session.accessLevel < 1 && userLocation != req.body.location) {
      unauthorized(res);
      logger.log(
        req.ip,
        `Tried to access protected resource without authorization.`,
        req.headers.authorization,
        "warn",
        session.userId,
        "incidents/create"
      );
      return;
    }
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
    var attachments = [];
    if (req.body.attachments != undefined || req.body.attachments != null) {
      var attachmentIds = req.body.attachments.split(",");
      for (var i = 0; i < attachmentIds.length; i++) {
        if (
          attachmentIds[i] != "" &&
          AttachmentSchema.findOne({ _id: attachmentIds[i] } != null)
        ) {
          attachments.push(attachmentIds[i]);
        }
      }
    }
    const incident = await IncidentSchema.create({
      inspectorId: session.userId,
      inspectedDateTime: req.body.inspectedDateTime,
      location: req.body.location,
      buildingId: req.body.buildingId,
      areasInspected: req.body.areasInspected,
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
      detailedEvaluationAreas: (req.body.detailedEvaluationAreas ?? "").split(
        ","
      ),
      otherRecommendations: req.body.otherRecommendations,
      furtherComments: req.body.furtherComments,
      attachments: attachments,
      severityStatus: Math.round(severityStatus * 3),
    });
    incidentReportSuccess(res, req.headers.authorization, incident._id);
    logging.log(
      req.ip,
      `Created incident report ${incident._id}.`,
      token,
      "info",
      userId,
      "incidents/create"
    );
  } catch (err) {
    databaseError(req, res, err);
    logging.log(
      req.ip,
      `Failed to create incident report.`,
      token,
      "error",
      userId,
      "incidents/create"
    );
    logging.err("Incident.Create", err);
    return;
  }
});

export default router;
