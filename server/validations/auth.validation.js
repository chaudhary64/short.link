import { z } from "zod";

const signUpSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters"),
  email: z.email({ error: "Email is required" }),
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
      .min(6, "Password must be at least 6 characters"),
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
