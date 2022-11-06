// packages
import { Router } from "express";

// modules
import {
  unauthorized,
  buildingNotFound,
  buildingDeleted,
} from "../../modules/responseGenerator.js";

// models
import BuildingSchema from "../../models/building.js";

const router = Router();

router.post("/", (req, res) => {
  unauthorized(res);
});

router.post("/:id", async (req, res) => {
  BuildingSchema.findById(req.params.id, (err, building) => {
    if (err) {
      console.log(err);
      buildingNotFound(res);
    } else {
      building.remove();
      buildingDeleted(res);
    }
  });
});
