import fs from "node:fs";
import path from "node:path";
import ejs from "ejs";
import transporter from "../config/mailer.js";

const getTemplatePath = (template, ext = "") =>
  path.join(import.meta.dirname, "../emails", `${template}${ext}.ejs`);

const LOGO_PATH = path.join(import.meta.dirname, "../emails/logo.png");
const LOGO_CID = "shortlink-logo";

export default async function sendEmail({ to, subject, template, data = {} }) {
  try {
    const htmlPath = getTemplatePath(template);
    const textPath = getTemplatePath(template, ".txt");

    const ejsOptions = { cache: true };
    const clientUrl = process.env.CLIENT_URL?.split(",")[0]?.trim() || "";

    // Embed the logo as an inline (CID) attachment so email clients that
    // block or rewrite external images — Gmail, Outlook — always render it.
    // Fall back to a hotlinked URL only if the bundled file is missing.
    const logoExists = fs.existsSync(LOGO_PATH);
    const renderData = {
      ...data,
      currentYear: new Date().getFullYear(),
      logoUrl: logoExists
        ? `cid:${LOGO_CID}`
        : clientUrl
          ? `${clientUrl}/favicon.png`
          : "https://short-link-ochre.vercel.app/favicon.png",
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
      ...(logoExists && {
        attachments: [
          {
            filename: "logo.png",
            path: LOGO_PATH,
            cid: LOGO_CID,
          },
        ],
      }),
    });
  } catch (error) {
    console.error(
      `[Email Service Error] Failed to send email to ${to} (template: ${template}):`,
      error,
    );
    throw error;
  }
}
