import { useState } from "react";
import Button from "../ui/Button";
import PageHeader from "../ui/PageHeader";
import { useToast } from "../../features/toast/useToast.jsx";
import { LuPlus } from "react-icons/lu";

const DashboardHeader = ({ createNewLink, isCreating }) => {
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
            className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center"
          >
            <input
              type="text"
              placeholder="https://example.com"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsCreatingLink(false);
                  setNewLinkUrl("");
                }
              }}
              autoFocus
              className="px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 flex-1 sm:w-64"
            />
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
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageHeader>
  );
};

export default DashboardHeader;
