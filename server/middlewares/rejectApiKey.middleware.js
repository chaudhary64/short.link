// Account routes are human-only. An API key is a delegated credential for
// links and analytics; letting one reach /api/auth would turn "manage my links"
// into "change my password" or "delete my account". Rejection is by credential
// type, not by scope, so no combination of scopes can widen a key into the
// account itself.
export default function rejectApiKey(req, res, next) {
  if (req.apiKey) {
    return res.status(403).json({
      message: "Forbidden: API keys cannot access account routes",
    });
  }

  next();
}
