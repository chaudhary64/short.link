import express from "express";
import getAnalyticsController from "../controllers/analytics/get.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import requireScope from "../middlewares/requireScope.middleware.js";

const analyticsRouter = express.Router();

analyticsRouter.use(authenticateMiddleware);

analyticsRouter.get("/", requireScope("read"), getAnalyticsController);

export default analyticsRouter;
