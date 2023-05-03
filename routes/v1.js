import { Router } from "express";

import rateLimiter from "../middlewares/rateLimiter.js";
import routeLogger from "../middlewares/routeLogger.js";

// routes
import login from "./v1/login.js";
import logout from "./v1/logout.js";
import signup from "./v1/signup.js";
import check from "./v1/check.js";
import incidents from "./v1/incidents.js";
import attachments from "./v1/attachments.js";
import buildings from "./v1/buildings.js";
import accounts from "./v1/accounts.js";
import misc from "./v1/misc.js";
import logs from "./v1/logs.js";

const router = Router();

router.use(rateLimiter);
router.use(routeLogger);
router.use("/login", login);
router.use("/logout", logout);
router.use("/signup", signup);
router.use("/check", check);
router.use("/incidents", incidents);
router.use("/attachments", attachments);
router.use("/buildings", buildings);
router.use("/accounts", accounts);
router.use("/misc", misc);
router.use("/logs", logs);

export default router;
