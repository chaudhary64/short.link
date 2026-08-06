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
    const clientUrl = process.env.CLIENT_URL?.split(",")[0]?.trim() || "";
    const renderData = {
      ...data,
      currentYear: new Date().getFullYear(),
      logoUrl: clientUrl ? `${clientUrl}/favicon.svg` : "https://short-link-ochre.vercel.app/favicon.svg",
    };

    const html = await ejs.renderFile(htmlPath, renderData, ejsOptions);
    const text = fs.existsSync(textPath)
      ? await ejs.renderFile(textPath, renderData, ejsOptions)
      : undefined;

    return await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
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

