import { Schema, model } from "mongoose";
const BuildingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  maxCapacity: {
    type: Number,
    required: true,
  },
  otherInformation: {
    type: String,
    default: "-n/a-",
  },
  address: {
    type: String,
    default: "-n/a-",
    required: true,
  },
  buildingMarshal: {
    type: String,
    default: "-n/a-",
    required: true,
  },
  storyAboveGround: {
    type: Number,
    default: 0,
    required: true,
  },
  storyBelowGround: {
    type: Number,
    default: 0,
    required: true,
  },
  typeOfConstruction: {
    type: String,
    default: "concrete",
    required: true,
  },
  primaryOccupancy: {
    type: String,
    default: "offices",
    required: true,
  },
  // array of item objects
  /*
  {
    name,
    itemCode,
    description,
  }
  */
  inventory: {
    type: Array,
    default: [],
  },
});

export default model("Building", BuildingSchema);
