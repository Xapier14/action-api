import { Router } from "express";

import rateLimiter from "../middlewares/rateLimiter.js";

// routes
import login from "./v1/login.js";
import signup from "./v1/signup.js";
import reports from "./v1/reports.js";

const router = Router();

router.use(rateLimiter);
router.use("/login", login);
router.use("/signup", signup);
router.use("/reports", reports);

export default router;
