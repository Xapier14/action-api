import { Router } from "express";
import needsAuthentication from "../../../middlewares/authentication.js";
import { mustBeAccessLevel } from "../../../middlewares/authorization.js";

const router = Router();
export default router;
