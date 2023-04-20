// packages
import { Router } from "express";

// middlewares
import { mustBeAccessLevel } from "../../middlewares/authorization.js";

// modules
import { fetchLogs, countLogs } from "../../modules/logging.js";
import {
  sendLogs,
  generalInternalError,
} from "../../modules/responseGenerator.js";

const router = Router();

router.get("/", mustBeAccessLevel(1));
router.get("/", async (req, res) => {
  const token = req.headers.authorization;

  const limit = Math.min(req.query.limit ?? 10, 100);
  const action = req.query.action ?? "";
  const ip = req.query.ip ?? "";
  const userId = req.query.userId ?? "";
  const totalLogCount = await countLogs(action, ip, userId);
  const maxPageOffset = Math.max(0, Math.ceil(totalLogCount / limit - 1));
  const pageOffset = Math.min(
    Math.max(req.query.pageOffset ?? 0, 0),
    maxPageOffset
  );
  const results = await fetchLogs(pageOffset, limit, action, ip, userId);
  if (results === null) {
    generalInternalError(req, res);
    return;
  }
  sendLogs(
    res,
    token,
    results,
    pageOffset,
    maxPageOffset,
    limit,
    totalLogCount
  );
});

export default router;
