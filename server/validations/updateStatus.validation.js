import { z } from "zod";

const updateStatusSchema = z.object({
  linkId: z.string().trim().min(1, "linkId is required"),
  status: z.enum(["active", "disabled"], {
    error: "status must be 'active' or 'disabled'",
  }),
});

const validateUpdateStatus = (req, res, next) => {
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

export default validateUpdateStatus;
