import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLink } from "../../api/links";
import { useToast } from "../../features/toast/useToast.jsx";
import Button from "../ui/Button";

const DashboardEmptyState = () => {
  const [url, setUrl] = useState("");
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: createLink,
    onSuccess: (res) => {
      const link = res.data?.link;
      setCreatedLink(link);
      setUrl("");
      toast.success("Link created!", "Your first short link is ready.");
      queryClient.invalidateQueries({ queryKey: ["LINKS_INFO"] });
    },
    onError: (err) => {
      toast.error(
        "Creation failed",
        err.response?.data?.message || "Please check your URL and try again."
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    mutation.mutate({ url: url.trim() });
  };

  const handleCopy = async () => {
    if (!createdLink?.short_code) return;
    try {
      await navigator.clipboard.writeText(
        import.meta.env.VITE_API_BASE_URL + "/" + createdLink.short_code
      );
      setCopied(true);
      toast.success("Copied!", "Short URL copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", "Could not copy to clipboard.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-[#10b981]/10 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-[#10b981]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#10b981]/20" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#10b981]/15" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        No links yet
      </h2>
      <p className="text-gray-500 text-center max-w-md mb-8 leading-relaxed">
        Create your first short link to get started. Paste any long URL below
        and we'll make it short and trackable.
      </p>

      {/* Inline creation form */}
      {!createdLink ? (
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/your-long-url"
              disabled={mutation.isPending}
              className="flex-1 bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 text-sm px-4 py-3 outline-none focus:border-[#10b981] transition-colors disabled:opacity-50"
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="medium"
              disabled={mutation.isPending || !url.trim()}
              className="!px-6"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating&hellip;
                </span>
              ) : (
                "Shorten URL"
              )}
            </Button>
          </div>
        </form>
      ) : (
        /* Result display */
        <div className="w-full max-w-lg bg-white border-2 border-[#10b981]/30 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#10b981]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">Your link is ready!</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-3">
            <span className="text-sm font-mono text-gray-900 truncate flex-1">
              {import.meta.env.VITE_API_BASE_URL}/{createdLink.short_code}
            </span>
            <button
              onClick={handleCopy}
              className="shrink-0 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => setCreatedLink(null)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            + Create another link
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardEmptyState;
