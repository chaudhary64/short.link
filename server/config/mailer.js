import nodemailer from "nodemailer";

const requiredVars = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
};

const missing = Object.entries(requiredVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(
    `Mailer configuration error: missing required environment variables: ${missing.join(", ")}. ` +
      `Email functionality will not work until these are set.`,
  );
}

const transporter = nodemailer.createTransport({
  host: requiredVars.SMTP_HOST,
  port: Number(requiredVars.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: requiredVars.SMTP_USER,
    pass: requiredVars.SMTP_PASSWORD,
  },
});

export default transporter;
