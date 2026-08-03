import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLink } from "../../api/links";
import { useToast } from "../../features/toast/useToast.jsx";
import Button from "../ui/Button";
import AliasAvailabilityHint from "../ui/AliasAvailabilityHint";
import { sanitizeShortCode, shortLinkHost } from "../../utils/format";
import {
  LuArrowRight,
  LuCheck,
  LuCopy,
  LuLink,
  LuLoaderCircle,
} from "react-icons/lu";

const DashboardEmptyState = () => {
  const [url, setUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
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
      setShortCode("");
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
    mutation.mutate({
      url: url.trim(),
      shortCode: shortCode.trim() || undefined,
    });
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
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-[#C1C1C9] bg-white/60 flex flex-col items-center justify-center py-16 px-6">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[480px] rounded-full bg-[#6366F1]/8 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-[0_12px_30px_-8px_rgba(99,102,241,0.45)]">
            <LuLink className="w-11 h-11 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#10B981] border-4 border-[#FAFAFA] rounded-xl flex items-center justify-center">
            <LuCheck className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-3 w-5 h-5 bg-[#F59E0B] border-4 border-[#FAFAFA] rounded-lg" />
        </div>

        <h2 className="text-2xl font-display font-bold tracking-[-0.03em] text-[#0A0A0A] mb-2">
          No links yet
        </h2>
        <p className="text-[#6B6B6B] max-w-md mb-8 leading-relaxed">
          Create your first short link to get started. Paste any long URL below
          and we&rsquo;ll make it short and trackable.
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
                className="flex-1 bg-white border border-[#D4D4D8] rounded-lg text-[#0A0A0A] placeholder:text-[#6B6B6B] text-sm px-3.5 py-2.5 outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 transition-all disabled:opacity-50"
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
                    <LuLoaderCircle className="animate-spin h-4 w-4" />
                    Creating&hellip;
                  </span>
                ) : (
                  <>
                    Shorten URL
                    <LuArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
            <div className="mt-3">
              <div className="flex items-center rounded-lg border border-[#D4D4D8] bg-white focus-within:border-[#6366F1] focus-within:ring-[3px] focus-within:ring-[#6366F1]/12 px-3 transition-all">
                <span className="text-xs font-mono text-[#6B6B6B] whitespace-nowrap shrink-0">
                  {shortLinkHost()}/
                </span>
                <input
                  type="text"
                  value={shortCode}
                  onChange={(e) => setShortCode(sanitizeShortCode(e.target.value))}
                  placeholder="alias (optional)"
                  disabled={mutation.isPending}
                  className="w-full py-2.5 pl-1.5 text-sm text-[#0A0A0A] bg-transparent outline-none placeholder:text-[#6B6B6B] transition-all disabled:opacity-50"
                />
              </div>
              <AliasAvailabilityHint alias={shortCode} />
            </div>
          </form>
        ) : (
          /* Result display */
          <div className="w-full max-w-lg bg-white border border-[#10B981]/30 rounded-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#10B981]/10 flex items-center justify-center rounded-lg shrink-0">
                <LuCheck className="w-4 h-4 text-[#10B981]" />
              </div>
              <span className="text-sm font-semibold text-[#0A0A0A]">Your link is ready!</span>
            </div>

            <div className="flex items-center gap-2 bg-[#F6F6F9] border border-[#D4D4D8] rounded-lg p-3">
              <span className="text-sm font-mono text-[#0A0A0A] truncate flex-1">
                {import.meta.env.VITE_API_BASE_URL}/{createdLink.short_code}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 px-3 py-1.5 bg-[#6366F1] text-white text-xs font-medium hover:bg-[#4F46E5] rounded-lg transition-all hover:-translate-y-px flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <LuCheck className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <LuCopy className="w-3.5 h-3.5" />
                    Copy link
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setCreatedLink(null)}
              className="mt-3 text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
            >
              + Create another link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardEmptyState;
