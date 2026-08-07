import { redisClient } from "../db/index.js";
import sendEmail from "./email.service.js";

const OTP_TTL_SECONDS = 600;

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpKey(email) {
  return `otp:${email}`;
}

export async function getStoredOtp(email) {
  const raw = await redisClient.get(otpKey(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function storeOtp(email, otp, userId) {
  await redisClient.setEx(
    otpKey(email),
    OTP_TTL_SECONDS,
    JSON.stringify({ otp, userId }),
  );
}

export async function clearOtp(email) {
  await redisClient.del(otpKey(email));
}

export async function sendVerificationCode(email, user) {
  const otp = generateOtp();
  await storeOtp(email, otp, user.id);
  await sendEmail({
    to: email,
    subject: "Your Short.link Verification Code",
    template: "verify-account",
    data: { name: user.name, otp },
  });
  return otp;
}
