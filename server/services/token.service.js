import { createSession } from "../repositories/session.repository.js";
import { getSessionClientInfo } from "../utils/clientInfo.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";

export default async function issueSessionTokens(user, req) {
  const refreshToken = generateRefreshToken(user);

  const session = await createSession({
    user_id: user.id,
    refresh_token: refreshToken,
    ...getSessionClientInfo(req),
  });

  const accessToken = generateAccessToken(user, session.session_id);

  return { accessToken, refreshToken, sessionId: session.session_id };
}
