import { z } from "zod";

const SHORT_CODE_PATTERN = /^[a-zA-Z0-9_-]+$/;

const httpUrlSchema = z
  .string({ error: "URL is required" })
  .trim()
  .min(1, "URL is required")
  .url("Invalid URL format")
  .refine((url) => /^https?:\/\//i.test(url), {
    message: "URL must start with http:// or https://",
  });

const shortCodeSchema = z
  .string()
  .trim()
  .transform((v) => (v.length === 0 ? undefined : v))
  .pipe(
    z.union([
      z.undefined(),
      z
        .string()
        .min(1, "Custom short code cannot be empty")
        .max(21, "Custom short code must be 21 characters or fewer")
        .regex(
          SHORT_CODE_PATTERN,
          "Custom short code can only contain letters, numbers, dashes, and underscores",
        ),
    ]),
  )
  .optional();

const linkSchema = z.object({
  originalUrl: httpUrlSchema,
  shortCode: shortCodeSchema,
});

const guestLinkSchema = z.object({
  originalUrl: httpUrlSchema,
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

export const validateGuestLink = (req, res, next) => {
  const result = guestLinkSchema.safeParse(req.body);

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
  originalUrl: httpUrlSchema,
  shortCode: shortCodeSchema,
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

const checkAliasSchema = z.object({
  alias: z
    .string()
    .trim()
    .min(1, "alias is required")
    .max(21, "Alias must be 21 characters or fewer")
    .regex(
      SHORT_CODE_PATTERN,
      "Alias can only contain letters, numbers, dashes, and underscores",
    ),
});

export const validateCheckAlias = (req, res, next) => {
  const result = checkAliasSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.validatedQuery = result.data;
  next();
};

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
