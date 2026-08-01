import { useState } from "react";
import Button from "../ui/Button";
import { useToast } from "../../features/toast/useToast.jsx";
import { LuPlus } from "react-icons/lu";

const DashboardHeader = ({ createNewLink, isCreating, totalLinks, activeLinks }) => {
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const toast = useToast();

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) {
      toast.warning("Empty URL", "Please enter a valid URL to shorten.");
      return;
    }
    createNewLink(
      { url: newLinkUrl.trim() },
      {
        onSuccess: () => {
          setIsCreatingLink(false);
          setNewLinkUrl("");
        },
      },
    );
  };

  const active = activeLinks ?? 0;
  const disabled = Math.max(0, totalLinks - active);

  const summary =
    totalLinks === 0
      ? "Shorten your first link to get started."
      : `${totalLinks} link${totalLinks === 1 ? "" : "s"} · ${active} active · ${disabled} disabled`;

  return (
    <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 bg-[#10b981] shrink-0" />
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-400">
            Dashboard
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Your links
        </h1>
        <p className="text-sm text-gray-500 mt-1">{summary}</p>
      </div>

      <div className="w-full sm:w-auto">
        {!isCreatingLink ? (
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => setIsCreatingLink(true)}
          >
            <LuPlus className="w-4 h-4 mr-2" />
            Create Link
          </Button>
        ) : (
          <form
            onSubmit={handleCreateSubmit}
            className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center"
          >
            <input
              type="text"
              placeholder="https://example.com"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              autoFocus
              className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 flex-1 sm:w-64"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                type="submit"
                size="small"
                disabled={isCreating}
                className="flex-1 sm:flex-none"
              >
                {isCreating ? "Shortening…" : "Shorten"}
              </Button>
              <Button
                variant="secondary"
                size="small"
                type="button"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  setIsCreatingLink(false);
                  setNewLinkUrl("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default DashboardHeader;
