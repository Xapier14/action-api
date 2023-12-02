// packages
import { Router } from "express";

// modules
import {
  databaseError,
  buildingNotFound,
  inventoryItemAdded,
  inventoryItemDeleted,
  inventoryItemNotFound,
} from "../../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../../modules/tokens.js";

// models
import BuildingSchema from "../../../../models/building.js";
import logging from "../../../../modules/logging.js";

const router = Router();

router.delete("/:building/:itemCode", async (req, res) => {
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  const buildingId = req.params.building;
  const itemCode = req.params.itemCode.toLowerCase();

  try {
    // get building
    const building = await BuildingSchema.findOne({ _id: buildingId });
    if (building === null) {
      buildingNotFound(res, building);
      return;
    }
    if (building.inventory == undefined) building.inventory = [];

    const filteredInventory = building.inventory.filter(
      (item) => item.itemCode != itemCode
    );
    const deleted = filteredInventory.length != building.inventory.length;
    building.inventory = filteredInventory;

    await building.save();
    if (deleted) {
      inventoryItemDeleted(res);
      logging.log(
        req.ip,
        `Deleted inventory item ${itemCode} from ${buildingId}.`,
        token,
        "info",
        userId,
        "deleteInventoryItem"
      );
    } else {
      inventoryItemNotFound(res, itemCode);
    }
  } catch (err) {
    databaseError(req, res, err);
    logging.log(
      req.ip,
      `Building ${buildingId} failed to delete item ${itemCode} in inventory.`,
      token,
      "error",
      userId,
      "deleteInventoryItem"
    );
    logging.err("Building.InventoryDelete", err);
    return;
  }
});

export default router;
