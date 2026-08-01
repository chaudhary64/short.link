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
          <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shrink-0" />
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9C9C9C]">
            Dashboard
          </span>
        </div>
        <h1 className="text-[28px] sm:text-[32px] font-display font-bold tracking-[-0.03em] text-[#0A0A0A]">
          Your links
        </h1>
        <p className="text-[15px] text-[#6B6B6B] mt-1">{summary}</p>
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
              className="px-3.5 py-2.5 border border-[#E8E8EC] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 flex-1 sm:w-64"
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
