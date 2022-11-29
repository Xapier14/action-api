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
});

export default model("Building", BuildingSchema);
