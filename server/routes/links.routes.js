import express from "express";
import getLinkController from "../controllers/link/get.controller.js";
import postLinkController from "../controllers/link/create.controller.js";
import createGuestLinkController from "../controllers/link/createGuest.controller.js";
import convertGuestLinkController from "../controllers/link/convertGuest.controller.js";
import removeLinkController from "../controllers/link/delete.controller.js";
import editLinkController from "../controllers/link/edit.controller.js";
import updateLinkStatusController from "../controllers/link/updateStatus.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import {
  validateLink,
  validateEditLink,
  validateDeleteLink,
  validateUpdateStatus,
  validateConvertGuest,
} from "../validations/links.validation.js";
import rateLimit from "../middlewares/rateLimit.middleware.js";

const linkRouter = express.Router();

// Guest link creation — no auth required, stored in Redis with 24hr TTL.
// Rate-limited per IP so the endpoint can't be used for spam.
const guestLinkLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

linkRouter.post("/guest", guestLinkLimiter, validateLink, createGuestLinkController);

// Authenticated routes
linkRouter.use(authenticateMiddleware);

linkRouter.get("/", getLinkController);
linkRouter.post("/", validateLink, postLinkController);
linkRouter.put("/:id", validateEditLink, editLinkController);
linkRouter.patch(
  "/:id/status",
  validateUpdateStatus,
  updateLinkStatusController,
);
linkRouter.delete("/:id", validateDeleteLink, removeLinkController);

// Convert a guest link to a permanent authenticated link (authenticated)
linkRouter.post("/convert-guest", validateConvertGuest, convertGuestLinkController);

export default linkRouter;
