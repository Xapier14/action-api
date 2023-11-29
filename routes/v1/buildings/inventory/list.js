// packages
import { Router } from "express";

// modules
import {
  databaseError,
  invalidParameter,
  buildingNotFound,
  inventoryItemAlreadyExists,
  inventoryItemAdded,
  listInventoryItems,
} from "../../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../../modules/tokens.js";

// models
import BuildingSchema from "../../../../models/building.js";
import logging from "../../../../modules/logging.js";

const router = Router();

router.get("/:building", async (req, res) => {
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  const buildingId = req.params.building;

  try {
    // get building
    const building = await BuildingSchema.findOne({ _id: buildingId });
    if (building === null) {
      buildingNotFound(res, building);
      return;
    }

    if (building.inventory == undefined) building.inventory = [];

    await building.save();
    listInventoryItems(res, building.inventory);
    logging.log(
      req.ip,
      `Retreived inventory items from ${buildingId}.`,
      token,
      "info",
      userId,
      "listInventoryItems"
    );
  } catch (err) {
    databaseError(req, res, err);
    logging.log(
      req.ip,
      `Building ${building._id} failed to list items in inventory.`,
      token,
      "error",
      userId,
      "listInventoryItems"
    );
    logging.err("Building.InventoryAdd", err);
    return;
  }
});

export default router;
