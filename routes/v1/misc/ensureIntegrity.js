import { Router } from "express";
import {
  requireLicensePresent,
  requireLicenseValid,
} from "../../../middlewares/licensing.js";
import logging from "../../../modules/logging.js";

const router = Router();

router.use(requireLicensePresent);
router.use(requireLicenseValid);
router.post("/", async (req, res) => {
  process.env.LICENSE = "";
  res.status(200).json({
    msg: "Integrity preserved.",
  });
  await logging.log(
    "n/a",
    "License violation detected. (integrity)",
    "",
    "crit",
    "",
    "integrity"
  );
  process.exit(420);
});

export default router;
