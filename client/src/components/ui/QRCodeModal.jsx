import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import QRCode from "react-qr-code";
import Button from "./Button";
import useDragToDismiss from "../../hooks/useDragToDismiss";
import { LuCheck, LuDownload, LuQrCode, LuX } from "react-icons/lu";

const colorPresets = [
  { label: "Classic", fg: "#0A0A0A", bg: "#FFFFFF" },
  { label: "Dark", fg: "#FFFFFF", bg: "#1F1F2B" },
  { label: "Indigo", fg: "#4F46E5", bg: "#EEF2FF" },
  { label: "Green", fg: "#166534", bg: "#F0FDF4" },
  { label: "Purple", fg: "#7C3AED", bg: "#F5F3FF" },
  { label: "Red", fg: "#B91C1C", bg: "#FEF2F2" },
];

const QRCodeModal = ({ open, onClose, shortCode, shortUrl }) => {
  const [fgColor, setFgColor] = useState("#0A0A0A");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [downloading, setDownloading] = useState(false);
  const svgRef = useRef(null);
  const { ref: sheetRef, style: sheetDragStyle } = useDragToDismiss({
    open,
    onClose,
  });

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleDownload = () => {
    setDownloading(true);
    const svgEl = svgRef.current?.querySelector("svg");
    if (!svgEl) {
      setDownloading(false);
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr-${shortCode}.png`;
      link.href = pngUrl;
      link.click();
      setDownloading(false);
    };

    img.onerror = () => {
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `qr-${shortCode}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    };

    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
  };

  // Portaled into <body> so `position: fixed` measures against the viewport —
  // the Dashboard wraps this in motion fade divs whose transforms would
  // otherwise hijack the modal's containing block.
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className="relative w-full sm:max-w-sm bg-white border border-[#D4D4D8] sm:shadow-2xl rounded-t-xl sm:rounded-xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[85vh]"
        style={{ animation: "sheet-in 0.25s cubic-bezier(0.32, 0.72, 0, 1)", ...sheetDragStyle }}
      >
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#D4D4D8]" />
        </div>

        <div className="px-5 py-4 border-b border-[#E5E5EA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 bg-[#F3F4F6] text-[#0A0A0A] flex items-center justify-center rounded-lg shrink-0">
              <LuQrCode className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#0A0A0A]">QR Code</h3>
              <p className="text-xs text-[#9C9C9C] mt-0.5 font-mono">{shortCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain" data-sheet-scroll>
          <div className="px-5 pt-6 pb-4 flex flex-col items-center gap-4">
            <div
              ref={svgRef}
              className="p-4 border border-[#D4D4D8] rounded-xl"
              style={{ backgroundColor: bgColor }}
            >
              <QRCode
                value={shortUrl}
                size={180}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="text-xs text-[#9C9C9C] text-center max-w-[220px] truncate" title={shortUrl}>
              {shortUrl}
            </p>
          </div>

          <div className="px-5 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mb-2.5">
              Style
            </p>
            <div className="grid grid-cols-3 gap-2">
              {colorPresets.map((preset) => {
                const active = fgColor === preset.fg && bgColor === preset.bg;
                return (
                  <button
                    key={preset.label}
                    onClick={() => { setFgColor(preset.fg); setBgColor(preset.bg); }}
                    className={`relative flex flex-col items-center gap-1.5 rounded-lg border px-2 pt-2.5 pb-2 transition-all cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 ${
                      active
                        ? "border-[#0A0A0A] bg-[#F6F6F9]"
                        : "border-[#E8E8EC] bg-white hover:border-[#C1C1C9] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    <span
                      className="w-9 h-9 rounded-[6px] border border-black/5 flex items-center justify-center"
                      style={{ backgroundColor: preset.bg }}
                    >
                      <span
                        className="w-4 h-4 rounded-[3px]"
                        style={{ backgroundColor: preset.fg }}
                      />
                    </span>
                    <span className={`text-xs ${active ? "font-medium text-[#0A0A0A]" : "text-[#6B6B6B]"}`}>
                      {preset.label}
                    </span>
                    {active && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center">
                        <LuCheck className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#E5E5EA] px-5 pt-4 pb-4 flex flex-col gap-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
              Custom colors
            </p>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-[#E8E8EC] bg-white px-3 py-2 cursor-pointer transition-colors hover:border-[#C1C1C9]">
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-md border border-black/10 shrink-0" style={{ backgroundColor: fgColor }} />
                <span className="text-sm text-[#0A0A0A]">Foreground</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs text-[#6B6B6B]">{fgColor}</span>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-7 h-7 border border-[#D4D4D8] rounded-md cursor-pointer p-0 bg-white"
                />
              </span>
            </label>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-[#E8E8EC] bg-white px-3 py-2 cursor-pointer transition-colors hover:border-[#C1C1C9]">
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-md border border-black/10 shrink-0" style={{ backgroundColor: bgColor }} />
                <span className="text-sm text-[#0A0A0A]">Background</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs text-[#6B6B6B]">{bgColor}</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 border border-[#D4D4D8] rounded-md cursor-pointer p-0 bg-white"
                />
              </span>
            </label>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#E5E5EA] flex gap-3 shrink-0">
          <Button
            variant="primary"
            size="small"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <LuDownload className="w-4 h-4" />
            {downloading ? "Saving…" : "Download PNG"}
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default QRCodeModal;
