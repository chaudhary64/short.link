import nodemailer from "nodemailer";
import mailGenerator from "../config/mailgen.js";

const sendEmail = async (to, subject, template) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const html = mailGenerator.generate(template);
    const text = mailGenerator.generatePlaintext(template);

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to,
      subject,
      html,
      text,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmail;
