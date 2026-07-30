import express from "express";
import getLinkController from "../controllers/link/get.controller.js";
import postLinkController from "../controllers/link/create.controller.js";
import createGuestLinkController from "../controllers/link/createGuest.controller.js";
import removeLinkController from "../controllers/link/delete.controller.js";
import editLinkController from "../controllers/link/edit.controller.js";
import updateLinkStatusController from "../controllers/link/updateStatus.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import {
  validateLink,
  validateEditLink,
  validateDeleteLink,
  validateUpdateStatus,
} from "../validations/links.validation.js";

const linkRouter = express.Router();

// Guest link creation — no auth required, stored in Redis with 24hr TTL
linkRouter.post("/guest", validateLink, createGuestLinkController);

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

export default linkRouter;
