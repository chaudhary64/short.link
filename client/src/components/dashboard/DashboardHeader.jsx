import { useState, useEffect } from "react";
import Button from "../ui/Button";
import PageHeader from "../ui/PageHeader";
import AliasAvailabilityHint from "../ui/AliasAvailabilityHint";
import useAliasAvailability from "../../hooks/useAliasAvailability";
import { useToast } from "../../features/toast/useToast.jsx";
import { sanitizeShortCode } from "../../utils/format";
import { isTypingTarget } from "../../utils/keyboard";
import { LuCheck, LuCopy, LuPlus } from "react-icons/lu";

const DashboardHeader = ({
  createNewLink,
  isCreating,
  isCreateOpen,
  setIsCreateOpen,
}) => {
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newShortCode, setNewShortCode] = useState("");
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);
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
    setCreatedLink(null);
    setCopied(false);
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
        onSuccess: (res) => {
          const link = res?.data?.link;
          setCreatedLink(link);
          setNewLinkUrl("");
          setNewShortCode("");
          setCopied(false);
        },
      },
    );
  };

  const handleCopy = async () => {
    if (!createdLink?.short_code) return;
    try {
      await navigator.clipboard.writeText(
        import.meta.env.VITE_API_BASE_URL + "/" + createdLink.short_code,
      );
      setCopied(true);
      toast.success("Copied!", "Short URL copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", "Could not copy to clipboard.");
    }
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
        ) : createdLink ? (
          <div className="w-full sm:w-96 bg-white border border-[#10B981]/30 rounded-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 bg-[#10B981]/10 flex items-center justify-center rounded-lg shrink-0">
                <LuCheck className="w-3.5 h-3.5 text-[#10B981]" />
              </span>
              <span className="text-sm font-semibold text-[#0A0A0A]">
                Your link is ready!
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#F6F6F9] border border-[#D4D4D8] rounded-lg p-2.5">
              <span className="text-sm font-mono text-[#0A0A0A] truncate flex-1">
                {import.meta.env.VITE_API_BASE_URL}/{createdLink.short_code}
              </span>
              <button
                onClick={handleCopy}
                aria-label={copied ? "Copied!" : "Copy short link"}
                className="shrink-0 px-3 py-1.5 bg-[#6366F1] text-white text-xs font-medium hover:bg-[#4F46E5] rounded-md transition-all hover:-translate-y-px flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <LuCheck className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <LuCopy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => {
                  setCreatedLink(null);
                  setCopied(false);
                  setNewLinkUrl("");
                  setNewShortCode("");
                }}
                className="text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
              >
                + Create another link
              </button>
              <button
                onClick={closeCreateFlow}
                className="text-xs font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
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
