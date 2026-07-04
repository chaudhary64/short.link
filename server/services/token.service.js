import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";


export default function generateTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
}
