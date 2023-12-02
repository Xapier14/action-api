// packages
import { Router } from "express";

// modules
import {
  databaseError,
  invalidParameter,
  buildingNotFound,
  inventoryItemAlreadyExists,
  inventoryItemAdded,
} from "../../../../modules/responseGenerator.js";
import { getUserIdFromToken } from "../../../../modules/tokens.js";

// models
import BuildingSchema from "../../../../models/building.js";
import logging from "../../../../modules/logging.js";

const router = Router();

router.post("/:building", async (req, res) => {
  const token = req.headers.authorization;
  const userId = await getUserIdFromToken(token);
  const buildingId = req.params.building;

  try {
    if (!req.body.name || req.body.name == "")
      return invalidParameter(res, "name");
    if (!req.body.itemCode || req.body.itemCode == "")
      return invalidParameter(res, "itemCode");
    const itemName = req.body.name;
    const itemCode = req.body.itemCode.toLowerCase();
    const itemDescription = req.body.description ?? "";

    // get building
    const building = await BuildingSchema.findOne({ _id: buildingId });
    if (building === null) {
      buildingNotFound(res, building);
      return;
    }
    if (building.inventory == undefined) building.inventory = [];

    const itemsWithSameItemCode = building.inventory.filter(
      (building) => building.itemCode == itemCode
    );
    if (itemsWithSameItemCode.length != 0) {
      // item with item code exists
      inventoryItemAlreadyExists(res, itemCode);
      return;
    }

    building.inventory.push({
      name: itemName,
      itemCode: itemCode,
      description: itemDescription,
    });
    await building.save();
    inventoryItemAdded(res, itemCode);
    logging.log(
      req.ip,
      `Inventory item ${itemCode} added to ${buildingId}.`,
      token,
      "info",
      userId,
      "addInventoryItem"
    );
  } catch (err) {
    databaseError(req, res, err);
    logging.log(
      req.ip,
      `Building ${building._id} failed to add item in inventory.`,
      token,
      "error",
      userId,
      "addInventoryItem"
    );
    logging.err("Building.InventoryAdd", err);
    return;
  }
});

export default router;
