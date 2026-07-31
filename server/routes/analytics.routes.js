import express from "express";
import getAnalyticsController from "../controllers/analytics/get.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const analyticsRouter = express.Router();

analyticsRouter.use(authenticateMiddleware);

analyticsRouter.get("/", getAnalyticsController);

export default analyticsRouter;
