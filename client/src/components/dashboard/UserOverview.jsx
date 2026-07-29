import { useState } from "react";
import { Link } from "react-router";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import { useToast } from "../../features/toast/useToast.jsx";

const UserOverview = ({ name, email, created_at, createNewLink, isCreating }) => {
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
      }
    );
  };

  return (
    <section className="flex flex-col justify-between items-center sm:items-end sm:flex-row gap-6 bg-white p-6 sm:p-8 border border-gray-200 shadow-sm relative overflow-hidden">

      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-50 border border-gray-100 rotate-45 pointer-events-none"></div>
      <div className="absolute -bottom-10 right-20 w-32 h-32 bg-gray-50 border border-gray-100 rotate-12 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 relative z-10 w-full sm:w-auto">
        <Avatar
          seed={name}
          className="w-20 h-20 text-2xl border-4 border-white shadow-sm shrink-0"
        />

        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {name}
          </h1>
          <p className="text-gray-500 mt-1">{email}</p>
          <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
            <Chip status="default">
              Member since{" "}
              {created_at ? new Date(created_at).getFullYear() : "—"}
            </Chip>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
        {!isCreatingLink ? (
          <>
            <Button
              as={Link}
              to="/settings"
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              Settings
            </Button>
            <Button
              variant="primary"
              className="flex-1 sm:flex-none"
              onClick={() => setIsCreatingLink(true)}
            >
              Create Link
            </Button>
          </>
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

export default UserOverview;
