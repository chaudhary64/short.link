import { createSession } from "../repositories/session.repository.js";
import { getSessionClientInfo } from "../utils/clientInfo.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";

/**
 * Creates a new session row for `user` (capturing device/location info)
 * and issues a token pair whose access token is bound to that session via
 * a `sid` claim. Because the authenticate middleware validates `sid`
 * against the sessions table on every request, revoking the session
 * invalidates the access token immediately.
 */
export default async function issueSessionTokens(user, req) {
  const refreshToken = generateRefreshToken(user);

  const session = await createSession({
    user_id: user.id,
    refresh_token: refreshToken,
    ...getSessionClientInfo(req),
  });

  const accessToken = generateAccessToken(user, session.session_id);

  return { accessToken, refreshToken };
}
