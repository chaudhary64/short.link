import { z } from "zod";

const createApiKeySchema = z.object({
  name: z
    .string({ error: "name is required" })
    .trim()
    .min(1, "name is required")
    .max(80, "name must be 80 characters or fewer"),
  scopes: z
    .array(z.enum(["read", "write"]), { error: "scopes are required" })
    .min(1, "at least one scope is required")
    .max(2, "unknown scope"),
});

export const validateCreateApiKey = (req, res, next) => {
  const result = createApiKeySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

const apiKeyIdSchema = z.object({
  id: z
    .string({ error: "id is required" })
    .regex(/^[1-9]\d*$/, "id must be a positive integer"),
});

export const validateApiKeyId = (req, res, next) => {
  const result = apiKeyIdSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  next();
};
