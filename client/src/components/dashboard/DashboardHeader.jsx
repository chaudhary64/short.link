import { useState, useEffect } from "react";
import AliasAvailabilityHint from "../ui/AliasAvailabilityHint";
import useAliasAvailability from "../../hooks/useAliasAvailability";
import { useToast } from "../../features/toast/useToast.jsx";
import { sanitizeShortCode } from "../../utils/format";
import { isTypingTarget } from "../../utils/keyboard";
const DashboardHeader = ({
  createNewLink,
  isCreating,
  isCreateOpen,
  setIsCreateOpen,
}) => {
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newShortCode, setNewShortCode] = useState("");
  const toast = useToast();
  const aliasStatus = useAliasAvailability(newShortCode);

  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      setIsCreateOpen(true);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setIsCreateOpen]);

  const closeCreateFlow = () => {
    setIsCreateOpen(false);
    setNewLinkUrl("");
    setNewShortCode("");
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) {
      toast.warning("Empty URL", "Please enter a valid URL to shorten.");
      return;
    }
    createNewLink(
      { url: newLinkUrl.trim(), shortCode: newShortCode.trim() || undefined },
      {
        onSuccess: () => {
          closeCreateFlow();
        },
      },
    );
  };

  return (    <section className="g-band">
      <div className="g-head">
        <div className="min-w-0 flex-1">
          <div className="g-kicker">OVERVIEW · LINK INVENTORY</div>
          <h1 className="g-h1">Dashboard</h1>
          <p className="g-sub">
            Create, manage and track your short links. State shown, not styled.
          </p>
        </div>

        <div className="w-full sm:w-auto sm:max-w-[620px] shrink-0">
          {!isCreateOpen ? (
            <button
              className="g-btn w-full sm:w-auto"
              onClick={() => setIsCreateOpen(true)}
              title="Create a new short link (n)"
            >
              Create Link
            </button>
          ) : (
            <form className="g-form" onSubmit={handleCreateSubmit}>
              <div className="flex flex-col sm:flex-row sm:items-end gap-x-4 gap-y-2">
                <div className="flex-1 sm:flex-none sm:w-52">
                  <label className="g-flabel" htmlFor="g-new-url">
                    URL
                  </label>
                  <input
                    id="g-new-url"
                    className="g-input"
                    type="text"
                    placeholder="https://example.com"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") closeCreateFlow();
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex-1 sm:flex-none sm:w-44">
                  <div className="flex items-center gap-2">
                    <label className="g-flabel" htmlFor="g-new-alias">
                      Alias <span className="g-muted">(optional)</span>
                    </label>
                    <AliasAvailabilityHint status={aliasStatus} />
                  </div>
                  <input
                    id="g-new-alias"
                    className="g-input"
                    type="text"
                    placeholder="alias"
                    value={newShortCode}
                    onChange={(e) =>
                      setNewShortCode(sanitizeShortCode(e.target.value))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Escape") closeCreateFlow();
                    }}
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="submit"
                    className="g-btn g-btn-sm"
                    disabled={isCreating}
                  >
                    {isCreating ? "Shortening…" : "Place Link"}
                  </button>
                  <button
                    type="button"
                    className="g-btn g-btn-line g-btn-sm"
                    onClick={closeCreateFlow}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
