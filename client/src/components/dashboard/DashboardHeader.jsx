import { useState, useEffect } from "react";
import Button from "../ui/Button";
import PageHeader from "../ui/PageHeader";
import AliasAvailabilityHint from "../ui/AliasAvailabilityHint";
import useAliasAvailability from "../../hooks/useAliasAvailability";
import { useToast } from "../../features/toast/useToast.jsx";
import { sanitizeShortCode } from "../../utils/format";
import { isTypingTarget } from "../../utils/keyboard";
import { LuPlus } from "react-icons/lu";

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

  return (
    <PageHeader
      title="Dashboard"
      subtitle="Create, manage, and track your short links in one place."
      className="gap-8 lg:gap-10"
    >
      <div className="w-full shrink-0 sm:w-auto">
        {!isCreateOpen ? (
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => setIsCreateOpen(true)}
            tooltip="Create a new short link (n)"
          >
            <LuPlus className="w-4 h-4 mr-2" />
            Create Link
          </Button>
        ) : (
          <form
            onSubmit={handleCreateSubmit}
            className="flex flex-col gap-2 w-full sm:w-auto"
          >
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <input
                type="text"
                placeholder="https://example.com"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    closeCreateFlow();
                  }
                }}
                autoFocus
                className="px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 flex-1 sm:w-64"
              />
              <div className="relative sm:w-64">
                <input
                  type="text"
                  placeholder="Custom alias (optional)"
                  value={newShortCode}
                  onChange={(e) =>
                    setNewShortCode(sanitizeShortCode(e.target.value))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      closeCreateFlow();
                    }
                  }}
                  className="px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 w-full"
                />
                <AliasAvailabilityHint
                  status={aliasStatus}
                  className="hidden sm:flex sm:absolute sm:top-full sm:left-0 sm:mt-1 sm:whitespace-nowrap"
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
                  onClick={closeCreateFlow}
                >
                  Cancel
                </Button>
              </div>
            </div>
            <AliasAvailabilityHint
              status={aliasStatus}
              className="sm:hidden"
            />
          </form>
        )}
      </div>
    </PageHeader>
  );
};

export default DashboardHeader;
