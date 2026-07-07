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
  linkId: z.string().trim().min(1, "linkId is required"),
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
  next();
};

const deleteLinkSchema = z.object({
  linkId: z.string().trim().min(1, "linkId is required"),
});

export const validateDeleteLink = (req, res, next) => {
  const result = deleteLinkSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  next();
};

const updateStatusSchema = z.object({
  linkId: z.string().trim().min(1, "linkId is required"),
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
  next();
};
