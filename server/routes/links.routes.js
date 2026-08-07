import express from "express";
import getLinkController from "../controllers/link/get.controller.js";
import postLinkController from "../controllers/link/create.controller.js";
import createGuestLinkController from "../controllers/link/createGuest.controller.js";
import convertGuestLinkController from "../controllers/link/convertGuest.controller.js";
import removeLinkController from "../controllers/link/delete.controller.js";
import editLinkController from "../controllers/link/edit.controller.js";
import updateLinkStatusController from "../controllers/link/updateStatus.controller.js";
import checkAliasController from "../controllers/link/checkAlias.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import {
  validateLink,
  validateGuestLink,
  validateEditLink,
  validateDeleteLink,
  validateUpdateStatus,
  validateConvertGuest,
  validateCheckAlias,
} from "../validations/links.validation.js";
import rateLimit from "../middlewares/rateLimit.middleware.js";

const linkRouter = express.Router();

const guestLinkLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

const checkAliasLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });

linkRouter.post(
  "/guest",
  guestLinkLimiter,
  validateGuestLink,
  createGuestLinkController,
);

linkRouter.use(authenticateMiddleware);

linkRouter.get("/", getLinkController);
linkRouter.get(
  "/check-alias",
  checkAliasLimiter,
  validateCheckAlias,
  checkAliasController,
);
linkRouter.post("/", validateLink, postLinkController);
linkRouter.put("/:id", validateEditLink, editLinkController);
linkRouter.patch(
  "/:id/status",
  validateUpdateStatus,
  updateLinkStatusController,
);
linkRouter.delete("/:id", validateDeleteLink, removeLinkController);

linkRouter.post(
  "/convert-guest",
  validateConvertGuest,
  convertGuestLinkController,
);

export default linkRouter;
