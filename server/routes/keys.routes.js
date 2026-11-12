import express from "express";
import getApiKeysController from "../controllers/apiKey/get.controller.js";
import createApiKeyController from "../controllers/apiKey/create.controller.js";
import revokeApiKeyController from "../controllers/apiKey/revoke.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import rejectApiKey from "../middlewares/rejectApiKey.middleware.js";
import {
  validateCreateApiKey,
  validateApiKeyId,
} from "../validations/apiKey.validation.js";

const keysRouter = express.Router();

// Keys are managed by the account owner in a browser session. A key must not
// be able to mint or revoke other keys, so the same guard that protects the
// account routes protects this one.
keysRouter.use(authenticateMiddleware, rejectApiKey);

keysRouter.get("/", getApiKeysController);
keysRouter.post("/", validateCreateApiKey, createApiKeyController);
keysRouter.delete("/:id", validateApiKeyId, revokeApiKeyController);

export default keysRouter;
