import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuCopy, LuKeyRound, LuLoaderCircle, LuTriangleAlert } from "react-icons/lu";
import Sheet from "../ui/Sheet";
import ModalSheet from "../ui/ModalSheet";
import Button from "../ui/Button";
import { formatDateTime } from "../../utils/format";
import { useToast } from "../../features/toast/useToast.jsx";
import { createApiKey, getApiKeys, revokeApiKey } from "../../api/keys";

const SCOPES = [
  { value: "read", label: "Read", hint: "List links and read analytics" },
  {
    value: "write",
    label: "Write",
    hint: "Create, edit, pause and delete links",
  },
];

const scopeLabel = (scope) =>
  SCOPES.find((option) => option.value === scope)?.label ?? scope;

const tokenStyle = {
  display: "block",
  padding: "10px 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--line-2)",
  borderRadius: "var(--r-sm)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-sm)",
  color: "var(--ink)",
  wordBreak: "break-all",
};

function RevokeModal({ apiKey, onClose, onConfirm, isPending }) {
  if (!apiKey) return null;

  return (
    <ModalSheet
      open
      onClose={onClose}
      ariaLabel="Revoke API key confirmation"
      header={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--surface)] flex items-center justify-center border border-[var(--danger)] shrink-0">
            <LuTriangleAlert className="w-5 h-5 text-[var(--danger)]" />
          </div>
          <div>
            <h3 className="g-modal-title">Revoke this key?</h3>
            <p className="g-modal-sub">{apiKey.name}</p>
          </div>
        </div>
      }
      footer={
        <>
          <Button
            variant="destructive"
            size="medium"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Revoking…" : "Revoke key"}
          </Button>
          <Button
            variant="secondary"
            size="medium"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
        </>
      }
    >
      <div className="g-modal-sub leading-relaxed">
        Anything using <code style={tokenStyle}>{apiKey.prefix}…</code> stops
        working immediately. This cannot be undone.
      </div>
    </ModalSheet>
  );
}

export default function ApiKeysPanel() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState("form");
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState(["read"]);
  const [createdToken, setCreatedToken] = useState("");
  const [revokingKey, setRevokingKey] = useState(null);

  const {
    data: keysData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["API_KEYS"],
    queryFn: getApiKeys,
  });

  const apiKeys = keysData?.data?.apiKeys ?? [];

  const openCreate = () => {
    setName("");
    setScopes(["read"]);
    setCreatedToken("");
    setCreateStep("form");
    setIsCreateOpen(true);
  };

  // Dropping the token on close keeps the plaintext key in state only while the
  // sheet is actually showing it.
  const closeCreate = () => {
    setIsCreateOpen(false);
    setCreatedToken("");
    setCreateStep("form");
  };

  const createMutation = useMutation({
    mutationFn: createApiKey,
    onSuccess: (res) => {
      setCreatedToken(res?.data?.token ?? "");
      setCreateStep("token");
      queryClient.invalidateQueries({ queryKey: ["API_KEYS"] });
      toast.success(
        "API key created",
        "Copy it now — the full key is only shown once.",
      );
    },
    onError: (err) => {
      toast.error(
        "Could not create key",
        err.response?.data?.message || "Please try again.",
      );
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => revokeApiKey(id),
    onSuccess: () => {
      setRevokingKey(null);
      queryClient.invalidateQueries({ queryKey: ["API_KEYS"] });
      toast.success("Key revoked", "That key can no longer authenticate.");
    },
    onError: (err) => {
      toast.error(
        "Could not revoke key",
        err.response?.data?.message || "Please try again.",
      );
    },
  });

  const toggleScope = (value) => {
    setScopes((current) =>
      current.includes(value)
        ? current.filter((scope) => scope !== value)
        : [...current, value],
    );
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(createdToken);
      toast.success("Copied", "API key copied to your clipboard.");
    } catch {
      toast.error("Copy failed", "Select the key and copy it manually.");
    }
  };

  const canCreate = name.trim().length > 0 && scopes.length > 0;

  const submit = (event) => {
    event.preventDefault();
    if (!canCreate) return;
    createMutation.mutate({ name: name.trim(), scopes });
  };

  return (
    <>
      <RevokeModal
        apiKey={revokingKey}
        onClose={() => setRevokingKey(null)}
        onConfirm={() => revokeMutation.mutate(revokingKey.id)}
        isPending={revokeMutation.isPending}
      />

      <Sheet
        open={isCreateOpen}
        onClose={closeCreate}
        title={createStep === "token" ? "Copy your key" : "Create an API key"}
        description={
          createStep === "token"
            ? "This is the only time the full key is shown."
            : "Name the key and choose what it may do."
        }
        footer={
          createStep === "token" ? (
            <button
              type="button"
              className="ui-btn ui-btn--sm"
              onClick={closeCreate}
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                className="ui-btn ui-btn--secondary ui-btn--sm"
                onClick={closeCreate}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-api-key-form"
                className="ui-btn ui-btn--sm"
                disabled={!canCreate || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <LuLoaderCircle className="w-3.5 h-3.5 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create key"
                )}
              </button>
            </>
          )
        }
      >
        {createStep === "form" ? (
          <form id="create-api-key-form" className="g-form" onSubmit={submit}>
            <div className="ui-field">
              <label className="ui-label" htmlFor="api-key-name">
                Name
              </label>
              <input
                id="api-key-name"
                className="ui-input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Claude Desktop"
                maxLength={80}
                autoFocus
              />
              <p className="metric-meta">
                So you can tell keys apart. Not used for anything else.
              </p>
            </div>

            <div className="ui-field">
              <span className="ui-label">Scopes</span>
              <div style={{ display: "grid", gap: 8 }}>
                {SCOPES.map((scope) => (
                  <label
                    key={scope.value}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      padding: "10px 12px",
                      border: "1px solid var(--line)",
                      borderRadius: "var(--r-sm)",
                      background: "var(--surface-2)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={scopes.includes(scope.value)}
                      onChange={() => toggleScope(scope.value)}
                      style={{
                        marginTop: 2,
                        accentColor: "var(--accent)",
                        width: 15,
                        height: 15,
                      }}
                    />
                    <span style={{ minWidth: 0 }}>
                      <span className="settings-row-title">{scope.label}</span>
                      <span className="settings-row-desc">{scope.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              {scopes.length === 0 && (
                <p className="metric-meta" style={{ color: "var(--danger)" }}>
                  Choose at least one scope.
                </p>
              )}
            </div>
          </form>
        ) : (
          <div className="ui-field">
            <span className="ui-label">Your new API key</span>
            <code style={tokenStyle}>{createdToken}</code>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="ui-btn ui-btn--secondary ui-btn--sm"
                onClick={copyToken}
              >
                <LuCopy className="w-3.5 h-3.5" />
                Copy key
              </button>
            </div>
            <p className="metric-meta">
              Store it somewhere safe. If you lose it, revoke it and create a
              new one.
            </p>
          </div>
        )}
      </Sheet>

      <div className="panel-head">
        <h2 className="panel-title">API keys</h2>
        <span className="panel-sub">Credentials for scripts and agents</span>
        <button
          type="button"
          className="ui-btn ui-btn--secondary ui-btn--sm"
          style={{ marginLeft: "auto" }}
          onClick={openCreate}
        >
          <LuKeyRound className="w-3.5 h-3.5" />
          Create key
        </button>
      </div>

      {isLoading &&
        [0, 1].map((i) => (
          <div key={i} className="settings-row">
            <div className="skeleton" style={{ width: 34, height: 34 }} />
            <div style={{ flex: 1, display: "grid", gap: 6 }}>
              <div className="skeleton" style={{ width: "35%", height: 11 }} />
              <div className="skeleton" style={{ width: "55%", height: 10 }} />
            </div>
          </div>
        ))}

      {!isLoading && isError && (
        <div className="settings-row">
          <p className="settings-row-desc">
            Could not load API keys.{" "}
            <button
              type="button"
              className="g-tab-clear"
              onClick={() => refetch()}
            >
              Try again
            </button>
          </p>
        </div>
      )}

      {!isLoading && !isError && apiKeys.length === 0 && (
        <div className="settings-row">
          <p className="settings-row-desc">
            No API keys yet. Create one to let a script or agent shorten links
            as you.
          </p>
        </div>
      )}

      {!isLoading &&
        !isError &&
        apiKeys.map((apiKey) => {
          const revoked = Boolean(apiKey.revoked_at);

          return (
            <div key={apiKey.id} className="settings-row">
              <span className="settings-row-icon">
                <LuKeyRound className="w-4 h-4" />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="settings-row-title">
                  {apiKey.name}
                  <code
                    style={{
                      marginLeft: 8,
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-xs)",
                      color: "var(--ink-4)",
                    }}
                  >
                    {apiKey.prefix}…
                  </code>
                  <span
                    className="badge"
                    data-tone={revoked ? "danger" : "active"}
                    style={{ marginLeft: 8 }}
                  >
                    {revoked ? "Revoked" : "Active"}
                  </span>
                </p>
                <p className="settings-row-desc">
                  {apiKey.scopes.map(scopeLabel).join(" · ")}
                  <span aria-hidden>·</span>
                  Created {formatDateTime(apiKey.created_at)}
                  <span aria-hidden>·</span>
                  {apiKey.last_used_at
                    ? `Last used ${formatDateTime(apiKey.last_used_at)}`
                    : "Never used"}
                </p>
              </div>
              {!revoked && (
                <button
                  type="button"
                  className="ui-btn ui-btn--danger ui-btn--sm"
                  onClick={() => setRevokingKey(apiKey)}
                >
                  Revoke
                </button>
              )}
            </div>
          );
        })}
    </>
  );
}
