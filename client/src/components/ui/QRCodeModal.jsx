import { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import Button from "./Button";

const colorPresets = [
  { label: "Classic", fg: "#000000", bg: "#ffffff" },
  { label: "Dark", fg: "#ffffff", bg: "#1a1a2e" },
  { label: "Blue", fg: "#1e40af", bg: "#eff6ff" },
  { label: "Green", fg: "#166534", bg: "#f0fdf4" },
  { label: "Purple", fg: "#7c3aed", bg: "#f5f3ff" },
  { label: "Red", fg: "#b91c1c", bg: "#fef2f2" },
];

const QRCodeModal = ({ open, onClose, shortCode, shortUrl }) => {
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [downloading, setDownloading] = useState(false);
  const svgRef = useRef(null);

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

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-sm bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden"
        style={{ animation: "sheet-in 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards" }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">QR Code</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{shortCode}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Code Display */}
        <div className="px-5 py-6 flex flex-col items-center gap-4">
          <div
            ref={svgRef}
            className="p-4 border border-gray-200 rounded-xl shadow-inner"
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

          <p className="text-xs text-gray-400 text-center max-w-[220px] truncate">
            {shortUrl}
          </p>
        </div>

        {/* Color Presets */}
        <div className="px-5 pb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Style</p>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => { setFgColor(preset.fg); setBgColor(preset.bg); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${
                  fgColor === preset.fg && bgColor === preset.bg
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: preset.bg }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: preset.fg }}
                />
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="px-5 pb-4 flex gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">FG</label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-7 h-7 border border-gray-200 rounded cursor-pointer p-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">BG</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-7 h-7 border border-gray-200 rounded cursor-pointer p-0"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <Button
            variant="primary"
            size="small"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
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
    </div>
  );
};

export default QRCodeModal;
