import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import QRCode from "react-qr-code";
import useDragToDismiss from "../../hooks/useDragToDismiss";
import { LuDownload, LuX } from "react-icons/lu";

const colorPresets = [
  { label: "Ink", fg: "#141414", bg: "#FFFFFF" },
  { label: "Paper", fg: "#F5F3EE", bg: "#141414" },
  { label: "Red", fg: "#D62828", bg: "#FFFFFF" },
  { label: "Blue", fg: "#1D4ED8", bg: "#FFFFFF" },
  { label: "Yellow", fg: "#EAB308", bg: "#FFFFFF" },
  { label: "Green", fg: "#1E7D4F", bg: "#FFFFFF" },
];

const QRCodeModal = ({ open, onClose, shortCode, shortUrl }) => {
  const [fgColor, setFgColor] = useState("#141414");
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

  return createPortal(
    <div className="g-modal-overlay">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        ref={sheetRef}
        className="g-modal"
        role="dialog"
        aria-modal="true"
        aria-label="QR code"
        style={sheetDragStyle}
      >
        <button className="g-modal-close" onClick={onClose} aria-label="Close">
          <LuX className="w-4 h-4" />
        </button>

        <div className="g-modal-head">
          <div>
            <h3 className="g-modal-title">QR Code</h3>
            <p className="g-modal-code">{shortCode}</p>
          </div>
        </div>

        <div className="g-qr-tile" ref={svgRef}>
          <QRCode
            value={shortUrl}
            size={180}
            fgColor={fgColor}
            bgColor={bgColor}
            level="H"
          />
        </div>

        <p className="g-modal-sub text-center truncate max-w-full" title={shortUrl}>
          {shortUrl}
        </p>

        <div>
          <p className="g-flabel">Style</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {colorPresets.map((preset) => {
              const active = fgColor === preset.fg && bgColor === preset.bg;
              return (
                <button
                  key={preset.label}
                  onClick={() => { setFgColor(preset.fg); setBgColor(preset.bg); }}
                  className={`g-op flex flex-col gap-1.5 items-center py-2.5 ${active ? "g-op-solid" : ""}`}
                  aria-pressed={active}
                >
                  <span
                    className="w-8 h-8 flex items-center justify-center border border-[#141414]"
                    style={{ backgroundColor: preset.bg }}
                  >
                    <span
                      className="w-4 h-4"
                      style={{ backgroundColor: preset.fg }}
                    />
                  </span>
                  <span className="text-[10px] leading-none">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="g-flabel">Custom colors</p>
          <div className="flex flex-col gap-2 mt-2">
            <label className="flex items-center justify-between gap-3 border border-[#141414] px-3 py-2 cursor-pointer">
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 border border-black/20 shrink-0" style={{ backgroundColor: fgColor }} />
                <span className="text-[11px] font-bold uppercase tracking-[0.1em]">Foreground</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="g-code text-xs">{fgColor}</span>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-7 h-7 border border-[#141414] cursor-pointer p-0 bg-white"
                  aria-label="Foreground color"
                />
              </span>
            </label>
            <label className="flex items-center justify-between gap-3 border border-[#141414] px-3 py-2 cursor-pointer">
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 border border-black/20 shrink-0" style={{ backgroundColor: bgColor }} />
                <span className="text-[11px] font-bold uppercase tracking-[0.1em]">Background</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="g-code text-xs">{bgColor}</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 border border-[#141414] cursor-pointer p-0 bg-white"
                  aria-label="Background color"
                />
              </span>
            </label>
          </div>
        </div>

        <div className="g-modal-actions">
          <button className="g-btn g-btn-sm" onClick={handleDownload} disabled={downloading}>
            <LuDownload className="w-4 h-4" aria-hidden />
            {downloading ? "Saving…" : "Download PNG"}
          </button>
          <button className="g-btn g-btn-line g-btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default QRCodeModal;
