import { useState } from "react";
import Button from "../ui/Button";
import PageHeader from "../ui/PageHeader";
import AliasAvailabilityHint from "../ui/AliasAvailabilityHint";
import { useToast } from "../../features/toast/useToast.jsx";
import { sanitizeShortCode, shortLinkHost } from "../../utils/format";
import { LuPlus } from "react-icons/lu";

const DashboardHeader = ({ createNewLink, isCreating }) => {
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newShortCode, setNewShortCode] = useState("");
  const toast = useToast();

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
          setIsCreatingLink(false);
          setNewLinkUrl("");
          setNewShortCode("");
        },
      },
    );
  };

  return (
    <PageHeader
      title="Dashboard"
      subtitle="Create, manage, and track your short links in one place."
      className="gap-8 lg:gap-10"
    >
      {/* Create Link button */}
      <div className="w-full shrink-0 sm:w-auto">
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
            className="relative flex flex-col gap-2 w-full sm:w-auto"
          >
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <input
                type="text"
                placeholder="https://example.com"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsCreatingLink(false);
                    setNewLinkUrl("");
                    setNewShortCode("");
                  }
                }}
                autoFocus
                className="px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 flex-1 sm:w-64"
              />
              <div className="flex items-center rounded-md border border-[#D4D4D8] bg-white focus-within:border-[#6366F1] focus-within:ring-[3px] focus-within:ring-[#6366F1]/12 px-3 transition-all sm:w-64">
                <span className="text-xs font-mono text-[#9C9C9C] whitespace-nowrap shrink-0">
                  {shortLinkHost()}/
                </span>
                <input
                  type="text"
                  placeholder="alias (optional)"
                  value={newShortCode}
                  onChange={(e) =>
                    setNewShortCode(sanitizeShortCode(e.target.value))
                  }
                  className="w-full py-2.5 pl-1.5 text-sm text-[#0A0A0A] bg-transparent focus:outline-none placeholder:text-[#9C9C9C]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  size="small"
                  disabled={isCreating}
                  className="flex-1 sm:flex-none"
                >
                  {isCreating ? "Shortening…" : "Shorten URL"}
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  type="button"
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    setIsCreatingLink(false);
                    setNewLinkUrl("");
                    setNewShortCode("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
            <AliasAvailabilityHint
              alias={newShortCode}
              className="sm:absolute sm:top-full sm:mt-1"
            />
          </form>
        )}
      </div>
    </PageHeader>
  );
};

export default DashboardHeader;
