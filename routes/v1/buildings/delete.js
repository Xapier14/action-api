// packages
import { Router } from "express";

// modules
import {
  buildingNotFound,
  buildingDeleted,
} from "../../../modules/responseGenerator.js";

// models
import BuildingSchema from "../../../models/building.js";

const router = Router();
router.delete("/:id", async (req, res) => {
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

export default router;
