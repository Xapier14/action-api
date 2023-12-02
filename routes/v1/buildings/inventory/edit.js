// packages
import { Router } from "express";

// modules
import {
  databaseError,
  invalidParameter,
  buildingNotFound,
  inventoryItemNotFound,
  inventoryItemAdded,
  inventoryItemEdited,
} from "../../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../../modules/tokens.js";

// models
import BuildingSchema from "../../../../models/building.js";
import logging from "../../../../modules/logging.js";

const router = Router();

router.post("/:building/:itemCode", async (req, res) => {
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  const buildingId = req.params.building;
  const itemCode = req.params.itemCode;

  try {
    let itemName = req.body.name;
    let itemDescription = req.body.description;
    if (itemName == "") itemName = undefined;

    // get building
    const building = await BuildingSchema.findOne({ _id: buildingId });
    if (building === null) {
      buildingNotFound(res, building);
      return;
    }
    if (building.inventory == undefined) building.inventory = [];

    const item = building.inventory.find((item) => item.itemCode == itemCode);

    if (item == undefined) {
      inventoryItemNotFound(res, itemCode);
      return;
    }

    item.name = itemName ?? item.name;
    item.description = itemDescription ?? item.description;

    building.markModified("inventory");
    await building.save();

    inventoryItemEdited(res, itemCode);
    logging.log(
      req.ip,
      `Inventory item ${itemCode} from ${buildingId} edited.`,
      token,
      "info",
      userId,
      "editInventoryItem"
    );
  } catch (err) {
    databaseError(req, res, err);
    logging.log(
      req.ip,
      `Building ${buildingId} failed to edit item ${itemCode} in inventory.`,
      token,
      "error",
      userId,
      "editInventoryItem"
    );
    logging.err("Building.InventoryAdd", err);
    return;
  }
});

export default router;
