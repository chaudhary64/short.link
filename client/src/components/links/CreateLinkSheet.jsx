import { useEffect, useMemo, useState } from "react";
import { LuCheck, LuLink2, LuLoaderCircle, LuTriangleAlert } from "react-icons/lu";
import Sheet from "../ui/Sheet";
import useAliasAvailability from "../../hooks/useAliasAvailability";
import { sanitizeShortCode } from "../../utils/format";
import { SHORTLINK_HOST } from "../../config/urls";

const normalizeUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (!parsed.hostname.includes(".")) return null;
    return { href: parsed.href, host: parsed.hostname };
  } catch {
    return null;
  }
};

const CreateLinkSheet = ({ open, onClose, onCreate, isCreating }) => {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);
  const aliasStatus = useAliasAvailability(code);

  const parsed = useMemo(() => normalizeUrl(url), [url]);

  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setUrl("");
    setCode("");
    setTouched(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open]);

  const showUrlError = touched && url.trim().length > 0 && !parsed;
  const blocked = aliasStatus === "taken" || aliasStatus === "checking";

  const submit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (!parsed || blocked) return;
    onCreate({
      url: parsed.href,
      shortCode: code.trim() || undefined,
    });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Create a short link"
      description="Paste a destination, choose an optional code, and start tracking."
      footer={
        <>
          <button
            type="button"
            className="ui-btn ui-btn--secondary ui-btn--sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-link-form"
            className="ui-btn ui-btn--sm"
            disabled={isCreating || !parsed || blocked}
          >
            {isCreating ? (
              <>
                <LuLoaderCircle className="w-3.5 h-3.5 animate-spin" aria-hidden />
                Creating…
              </>
            ) : (
              "Create link"
            )}
          </button>
        </>
      }
    >
      <form id="create-link-form" className="g-form" onSubmit={submit} noValidate>
        <div className="ui-field">
          <label className="ui-label" htmlFor="new-destination">
            Destination URL
          </label>
          <input
            id="new-destination"
            className="ui-input"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com/page"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={showUrlError}
            aria-describedby="new-destination-hint"
            autoFocus
          />
          <p
            id="new-destination-hint"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              margin: 0,
              fontSize: "var(--text-xs)",
              color: showUrlError ? "var(--danger)" : "var(--ink-4)",
            }}
            role="status"
          >
            {showUrlError ? (
              <>
                <LuTriangleAlert className="w-3 h-3" aria-hidden />
                Enter a full URL, for example https://example.com/pricing
              </>
            ) : parsed ? (
              <>
                <LuCheck
                  className="w-3 h-3"
                  style={{ color: "var(--success)" }}
                  aria-hidden
                />
                Valid URL · {parsed.host}
              </>
            ) : (
              "http:// is added automatically if you leave it out."
            )}
          </p>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="new-code">
            Short code <span className="g-muted">· optional</span>
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              border: "1px solid var(--line-2)",
              borderRadius: "var(--r-sm)",
              background: "var(--surface)",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 var(--space-2-5)",
                borderRight: "1px solid var(--line)",
                background: "var(--surface-2)",
                color: "var(--ink-4)",
                fontSize: "var(--text-sm)",
                fontFamily: "var(--font-mono)",
                whiteSpace: "nowrap",
              }}
            >
              {SHORTLINK_HOST}/
            </span>
            <input
              id="new-code"
              className="ui-input"
              style={{
                border: 0,
                borderRadius: 0,
                fontFamily: "var(--font-mono)",
                boxShadow: "none",
              }}
              type="text"
              placeholder="spring-drop"
              value={code}
              maxLength={21}
              onChange={(event) => setCode(sanitizeShortCode(event.target.value))}
              aria-describedby="new-code-hint"
            />
          </div>
          <p
            id="new-code-hint"
            role="status"
            style={{
              margin: 0,
              fontSize: "var(--text-xs)",
              color:
                aliasStatus === "taken"
                  ? "var(--danger)"
                  : aliasStatus === "available"
                    ? "var(--success)"
                    : "var(--ink-4)",
            }}
          >
            {aliasStatus === "checking" && "Checking availability…"}
            {aliasStatus === "available" && "Available"}
            {aliasStatus === "taken" && "That code is already taken"}
            {aliasStatus === "error" && "Could not check — you can still try"}
            {aliasStatus === "idle" && "Letters, numbers, dashes and underscores."}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-2-5) var(--space-3)",
            border: "1px dashed var(--line-2)",
            borderRadius: "var(--r-sm)",
            background: "var(--surface-2)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            color: "var(--ink-3)",
            overflow: "hidden",
          }}
        >
          <LuLink2 className="w-3.5 h-3.5 shrink-0" aria-hidden />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {SHORTLINK_HOST}/
            <strong style={{ color: "var(--ink)" }}>
              {code.trim() || "your-code"}
            </strong>
          </span>
        </div>

        <p className="g-muted" style={{ margin: 0, lineHeight: 1.5 }}>
          A QR code and full click analytics are created automatically. The link
          starts live and can be paused at any time.
        </p>
      </form>
    </Sheet>
  );
};

export default CreateLinkSheet;
