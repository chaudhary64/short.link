import express from "express";
import loginController from "../controllers/auth/login.controller.js";
import signupController from "../controllers/auth/signup.controller.js";
import { updateInfoController } from "../controllers/auth/update.controller.js";
import { deleteUserController } from "../controllers/auth/delete.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import validateSignup from "../validations/signup.validation.js";
import validateLogin from "../validations/login.validation.js";
import validateUpdateUser from "../validations/update.validation.js";
import logoutController from "../controllers/auth/logout.controller.js";

const authRouter = express.Router();


authRouter.post("/signup", validateSignup, signupController);
authRouter.post("/login", validateLogin, loginController);
authRouter.delete("/logout", logoutController);


authRouter.put(
  "/user",
  authenticateMiddleware,
  validateUpdateUser,
  updateInfoController,
);
authRouter.delete("/user", authenticateMiddleware, deleteUserController);

export default authRouter;
