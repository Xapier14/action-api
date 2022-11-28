import { Schema, model } from "mongoose";
const IncidentSchema = new Schema({
  // Inspection
  inspectorId: {
    type: String,
    required: true,
  },
  inspectedDateTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  areasInspected: {
    type: String, // exterior || exterior&interior
    required: true,
  },
  // Building Description
  buildingId: {
    type: String,
    required: true,
  },
  // Evaluation
  collapsedStructure: {
    type: Number,
    required: true,
  },
  leaningOrOutOfPlumb: {
    type: Number,
    required: true,
  },
  damageToPrimaryStructure: {
    type: Number,
    required: true,
  },
  fallingHazards: {
    type: Number,
    required: true,
  },
  groundMovementOrSlope: {
    type: Number,
    required: true,
  },
  damagedSubmergedFixtures: {
    type: Number,
    required: true,
  },
  proximityRiskTitle: {
    type: String,
    default: "-n/a-",
  },
  proximityRisk: {
    type: Number,
    default: 0,
  },
  evaluationComment: {
    type: String,
    default: "-n/a-",
  },
  estimatedBuildingDamage: {
    type: Number,
    required: true,
  },
  // Posting
  inspectedPlacard: {
    type: Boolean,
    default: false,
  },
  restrictedPlacard: {
    type: Boolean,
    default: false,
  },
  unsafePlacard: {
    type: Boolean,
    default: false,
  },
  doNotEnter: {
    type: String,
    default: "",
  },
  briefEntryAllowed: {
    type: String,
    default: "",
  },
  doNotUse: {
    type: Boolean,
    default: false,
  },
  otherRestrictions: {
    type: String,
    default: "-n/a-",
  },
  // Further Actions
  barricadeComment: {
    type: String,
    default: "-n/a-",
  },
  detailedEvaluationAreas: {
    type: Array,
    default: [],
  },
  otherRecommendations: {
    type: String,
    default: "",
  },
  furtherComments: {
    type: String,
    default: "-n/a-",
  },
  // Misc
  attachments: {
    type: Array,
    default: [],
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  severityStatus: {
    type: Number,
    default: 0,
  },
});

export default model("Incident", IncidentSchema);
