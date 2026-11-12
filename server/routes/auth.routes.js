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
  validateRequestEmailChange,
  validateVerifyEmailChange,
  validateVerifyOtp,
  validateResendCode,
} from "../validations/auth.validation.js";
import logoutController from "../controllers/auth/logout.controller.js";
import refreshController from "../controllers/refresh/get.controller.js";
import googleController from "../controllers/auth/google.controller.js";
import forgotPasswordController from "../controllers/auth/forgot-password.controller.js";
import renderResetPasswordController from "../controllers/auth/render-reset-password.controller.js";
import updatePasswordController from "../controllers/auth/update-password.controller.js";
import verifyAccountController from "../controllers/auth/verify-account.controller.js";
import resendCodeController from "../controllers/auth/resend-code.controller.js";
import { changePasswordController } from "../controllers/auth/change-password.controller.js";
import { setPasswordController } from "../controllers/auth/set-password.controller.js";
import {
  getSessionsController,
  revokeSessionController,
  revokeAllSessionsController,
} from "../controllers/auth/sessions.controller.js";
import linkGoogleController from "../controllers/auth/link-google.controller.js";
import { requestEmailChangeController } from "../controllers/auth/request-email-change.controller.js";
import { verifyEmailChangeController } from "../controllers/auth/verify-email-change.controller.js";
import {
  validateChangePassword,
  validateSetPassword,
} from "../validations/auth.validation.js";
import rateLimit from "../middlewares/rateLimit.middleware.js";
import rejectApiKey from "../middlewares/rejectApiKey.middleware.js";

const authRouter = express.Router();

// Every protected route below is the account acting as itself, so it takes a
// browser session and refuses API keys outright.
const authenticateSession = [authenticateMiddleware, rejectApiKey];

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
const resendCodeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyFn: (req) => req.body?.email || "anonymous",
});

const emailChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyFn: (req) => req.user?.id || "anonymous",
});

authRouter.post("/register", registerLimiter, validateSignup, signupController);
authRouter.post("/login", loginLimiter, validateLogin, loginController);

authRouter.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validateForgotPassword,
  forgotPasswordController,
);

authRouter.get("/reset-password/:token", renderResetPasswordController);

authRouter.post(
  "/reset-password/:token",
  validateResetPassword,
  updatePasswordController,
);
authRouter.post("/google", googleController);
authRouter.post("/logout", logoutController);
authRouter.get("/refresh", refreshController);

authRouter.post(
  "/verify-email",
  verifyEmailLimiter,
  validateVerifyOtp,
  verifyAccountController,
);
authRouter.post(
  "/resend-code",
  resendCodeLimiter,
  validateResendCode,
  resendCodeController,
);

authRouter.put(
  "/me",
  authenticateSession,
  validateUpdateUser,
  updateInfoController,
);

authRouter.put(
  "/change-password",
  authenticateSession,
  validateChangePassword,
  changePasswordController,
);

authRouter.put(
  "/set-password",
  authenticateSession,
  validateSetPassword,
  setPasswordController,
);

authRouter.post("/link-google", authenticateSession, linkGoogleController);

authRouter.put(
  "/request-email-change",
  authenticateSession,
  emailChangeLimiter,
  validateRequestEmailChange,
  requestEmailChangeController,
);

authRouter.put(
  "/verify-email-change",
  authenticateSession,
  verifyEmailLimiter,
  validateVerifyEmailChange,
  verifyEmailChangeController,
);

authRouter.delete("/me", authenticateSession, deleteUserController);

authRouter.get("/sessions", authenticateSession, getSessionsController);
authRouter.delete(
  "/sessions/:id",
  authenticateSession,
  revokeSessionController,
);
authRouter.delete(
  "/sessions",
  authenticateSession,
  revokeAllSessionsController,
);

export default authRouter;
