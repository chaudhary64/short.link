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
  validateForgotPassword,
} from "../validations/auth.validation.js";
import logoutController from "../controllers/auth/logout.controller.js";
import refreshController from "../controllers/refresh/get.controller.js";
import googleController from "../controllers/auth/google.controller.js";
import forgotPasswordController from "../controllers/auth/forgot-password.controller.js";
import renderResetPasswordController from "../controllers/auth/render-reset-password.controller.js";
import updatePasswordController from "../controllers/auth/update-password.controller.js";
import verifyAccountController from "../controllers/auth/verify-account.controller.js";
import { changePasswordController } from "../controllers/auth/change-password.controller.js";
import { setPasswordController } from "../controllers/auth/set-password.controller.js";
import linkGoogleController from "../controllers/auth/link-google.controller.js";
import { validateChangePassword, validateSetPassword } from "../validations/auth.validation.js";
import rateLimit from "../middlewares/rateLimit.middleware.js";

const authRouter = express.Router();

// Per-IP rate limits to blunt credential stuffing, OTP brute force, and email bombing
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyFn: (req) => req.body?.email || "anonymous",
});
const verifyEmailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  keyFn: (req) => req.body?.email || "anonymous",
});

authRouter.post("/register", registerLimiter, validateSignup, signupController);
authRouter.post("/login", loginLimiter, validateLogin, loginController);

authRouter.post("/forgot-password", forgotPasswordLimiter, validateForgotPassword, forgotPasswordController);

authRouter.get("/reset-password/:token", renderResetPasswordController);

authRouter.post(
  "/reset-password/:token",
  validateResetPassword,
  updatePasswordController,
);
authRouter.post("/google", googleController);
authRouter.post("/logout", logoutController);
authRouter.get("/refresh", refreshController);

authRouter.post("/verify-email", verifyEmailLimiter, verifyAccountController);

authRouter.put(
  "/me",
  authenticateMiddleware,
  validateUpdateUser,
  updateInfoController,
);

authRouter.put(
  "/change-password",
  authenticateMiddleware,
  validateChangePassword,
  changePasswordController,
);

authRouter.put(
  "/set-password",
  authenticateMiddleware,
  validateSetPassword,
  setPasswordController,
);

authRouter.post(
  "/link-google",
  authenticateMiddleware,
  linkGoogleController,
);
authRouter.delete("/me", authenticateMiddleware, deleteUserController);

export default authRouter;
