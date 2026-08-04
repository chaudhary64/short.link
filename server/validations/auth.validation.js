import { z } from "zod";

const signUpSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters"),
  email: z.string({ error: "Email is required" }).trim().email("Invalid email address"),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

export const validateSignup = (req, res, next) => {
  const result = signUpSchema.safeParse(req.body);

  if (!result.success) {
    const { fieldErrors, formErrors } = result.error.flatten();

    return res.status(400).json({
      message: "Validation failed",
      errors: Object.keys(fieldErrors).length ? fieldErrors : formErrors,
    });
  }

  next();
};

const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string({ error: "Password is required" })
    .trim()
    .min(6, "Password must be at least 6 characters long"),
});

export const validateLogin = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  next();
};

const updateUserSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
});

export const validateUpdateUser = (req, res, next) => {
  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

const resetPasswordSchema = z
  .object({
    password: z
      .string({ error: "Password is required" })
      .trim()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string({ error: "Confirm Password is required" }).trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const validateResetPassword = (req, res, next) => {
  const result = resetPasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  next();
};

const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: "Current password is required" })
    .min(1, "Current password is required"),
  newPassword: z
    .string({ error: "New password is required" })
    .min(8, "New password must be at least 8 characters"),
});

export const validateChangePassword = (req, res, next) => {
  const result = changePasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

const setPasswordSchema = z.object({
  newPassword: z
    .string({ error: "New password is required" })
    .min(8, "New password must be at least 8 characters"),
});

export const validateSetPassword = (req, res, next) => {
  const result = setPasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

const forgotPasswordSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

export const validateForgotPassword = (req, res, next) => {
  const result = forgotPasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

const requestEmailChangeSchema = z.object({
  newEmail: z
    .string({ error: "New email is required" })
    .trim()
    .min(1, "New email is required")
    .email("Invalid email address"),
});

export const validateRequestEmailChange = (req, res, next) => {
  const result = requestEmailChangeSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

const verifyEmailChangeSchema = z.object({
  otp: z
    .string({ error: "OTP is required" })
    .min(6, "OTP must be 6 characters")
    .max(6, "OTP must be 6 characters"),
});

export const validateVerifyEmailChange = (req, res, next) => {
  const result = verifyEmailChangeSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};
