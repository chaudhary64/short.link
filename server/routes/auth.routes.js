import express from "express";
import loginController from "../controllers/auth/login.controller.js";
import signupController from "../controllers/auth/signup.controller.js";
import { updateInfoController } from "../controllers/auth/update.controller.js";
import { deleteUserController } from "../controllers/auth/delete.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { validateSignup, validateLogin, validateUpdateUser } from "../validations/auth.validation.js";
import logoutController from "../controllers/auth/logout.controller.js";
import refreshController from "../controllers/refresh/get.controller.js";

const authRouter = express.Router();

authRouter.post("/register", validateSignup, signupController);
authRouter.post("/login", validateLogin, loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/refresh", refreshController);


authRouter.put(
  "/me",
  authenticateMiddleware,
  validateUpdateUser,
  updateInfoController,
);
authRouter.delete("/me", authenticateMiddleware, deleteUserController);

export default authRouter;
