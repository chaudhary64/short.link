import { z } from "zod";

const linkSchema = z.object({
  originalUrl: z
    .string({ error: "URL is required" })
    .trim()
    .min(1, "URL is required")
    .url("Invalid URL format"),
});

export const validateLink = (req, res, next) => {
  const result = linkSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

const editLinkSchema = z.object({
  originalUrl: z
    .string({ error: "URL is required" })
    .trim()
    .min(1, "URL is required")
    .url("Invalid URL format"),
});

export const validateEditLink = (req, res, next) => {
  const result = editLinkSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  const paramResult = idParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: paramResult.error.flatten().fieldErrors,
    });
  }
  next();
};

const idParamSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

export const validateDeleteLink = (req, res, next) => {
  const result = idParamSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  next();
};

const convertGuestSchema = z.object({
  short_code: z
    .string({ error: "short_code is required" })
    .trim()
    .min(1, "short_code is required"),
  fingerprint: z
    .string({ error: "fingerprint is required" })
    .trim()
    .min(1, "fingerprint is required")
    .length(16, "Invalid fingerprint format"),
});

export const validateConvertGuest = (req, res, next) => {
  const result = convertGuestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

const updateStatusSchema = z.object({
  status: z.enum(["active", "disabled"], {
    error: "status must be 'active' or 'disabled'",
  }),
});

export const validateUpdateStatus = (req, res, next) => {
  const result = updateStatusSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  const paramResult = idParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: paramResult.error.flatten().fieldErrors,
    });
  }
  next();
};
