import express from "express";
import getLinkController from "../controllers/link/get.controller.js";
import postLinkController from "../controllers/link/create.controller.js";
import removeLinkController from "../controllers/link/delete.controller.js";
import editLinkController from "../controllers/link/edit.controller.js";
import updateLinkStatusController from "../controllers/link/updateStatus.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import validateLink from "../validations/link.validation.js";
import validateEditLink from "../validations/editLink.validation.js";
import validateDeleteLink from "../validations/deleteLink.validation.js";
import validateUpdateStatus from "../validations/updateStatus.validation.js";

const linkRouter = express.Router();


linkRouter.use(authenticateMiddleware);

linkRouter.get("/all", getLinkController);
linkRouter.post("/", validateLink, postLinkController);
linkRouter.put("/edit", validateEditLink, editLinkController);
linkRouter.patch("/status", validateUpdateStatus, updateLinkStatusController);
linkRouter.delete("/delete", validateDeleteLink, removeLinkController);

export default linkRouter;
