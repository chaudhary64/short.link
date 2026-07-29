import fs from "node:fs";
import path from "node:path";
import ejs from "ejs";
import transporter from "../config/mailer.js";

const getTemplatePath = (template, ext = "") =>
  path.join(import.meta.dirname, "../emails", `${template}${ext}.ejs`);

export default async function sendEmail({ to, subject, template, data = {} }) {
  try {
    const htmlPath = getTemplatePath(template);
    const textPath = getTemplatePath(template, ".txt");

    const ejsOptions = { cache: true };

    const html = await ejs.renderFile(htmlPath, data, ejsOptions);
    const text = fs.existsSync(textPath)
      ? await ejs.renderFile(textPath, data, ejsOptions)
      : undefined;

    return await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      ...(text && { text }),
    });
  } catch (error) {
    console.error(
      `[Email Service Error] Failed to send email to ${to} (template: ${template}):`,
      error
    );
    throw error;
  }
}

