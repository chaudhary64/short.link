import express from "express";
import loginController from "../controllers/auth/login.controller.js";
import signupController from "../controllers/auth/signup.controller.js";
import { updateInfoController } from "../controllers/auth/update.controller.js";
import { deleteUserController } from "../controllers/auth/delete.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import {
  validateSignup,
  validateLogin,
  validateUpdateUser,
  validateResetPassword,
} from "../validations/auth.validation.js";
import logoutController from "../controllers/auth/logout.controller.js";
import refreshController from "../controllers/refresh/get.controller.js";
import googleController from "../controllers/auth/google.controller.js";
import forgotPasswordController from "../controllers/auth/forgot-password.controller.js";
import renderResetPasswordController from "../controllers/auth/render-reset-password.controller.js";
import updatePasswordController from "../controllers/auth/update-password.controller.js";

const authRouter = express.Router();

authRouter.post("/register", validateSignup, signupController);
authRouter.post("/login", validateLogin, loginController);

// 1. Generate token and send email to the user
authRouter.post("/forgot-password", forgotPasswordController);

// 2. Render the reset password EJS template when user clicks the email link
authRouter.get("/reset-password/:token", renderResetPasswordController);

// 3. Update the database with the new password
authRouter.post(
  "/reset-password/:token",
  validateResetPassword,
  updatePasswordController,
);
authRouter.post("/google", googleController);
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
