import { useState, useRef, useCallback, useEffect } from "react";
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
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const closeTimerRef = useRef(null);
  const svgRef = useRef(null);
  const { ref: sheetRef, style: sheetDragStyle } = useDragToDismiss({
    open,
    onClose,
  });

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimerRef.current = setTimeout(() => {
      onCloseRef.current();
      closingRef.current = false;
      setClosing(false);
    }, 200);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dialog = sheetRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement;
    dialog.focus({ preventScroll: true });

    const FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () =>
      Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, sheetRef]);

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
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-[rgba(20,20,20,0.55)]"
        onClick={close}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="QR code"
        tabIndex={-1}
        className="relative w-full sm:max-w-[400px] bg-[#f5f3ee] border-2 border-[#141414] sm:shadow-[8px_8px_0_#141414] overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[85vh] outline-none"
        style={{
          animation: closing
            ? "none"
            : "sheet-in 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
          ...sheetDragStyle,
          ...(closing
            ? {
                transform: "translateY(110%)",
                transition: "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
              }
            : {}),
        }}
      >
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#D4D4D8]" />
        </div>

        <div className="px-5 py-4 sm:px-4 sm:py-3 border-b-2 border-[#141414] flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h3 className="g-modal-title">QR Code</h3>
            <p className="g-modal-code">{shortCode}</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="g-modal-close static shrink-0"
            aria-label="Close"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-4 flex flex-col gap-4 sm:gap-3"
          data-sheet-scroll
        >
          <div className="g-qr-tile sm:p-2" ref={svgRef}>
            <QRCode
              value={shortUrl}
              size={180}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
            />
          </div>

          <p
            className="g-modal-sub text-center truncate max-w-full"
            title={shortUrl}
          >
            {shortUrl}
          </p>

          <div>
            <p className="g-flabel">Style</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
              {colorPresets.map((preset) => {
                const active = fgColor === preset.fg && bgColor === preset.bg;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className={`g-op flex flex-col gap-1.5 items-center py-2.5 sm:py-1.5 ${active ? "g-op-solid" : ""}`}
                    aria-pressed={active}
                  >
                    <span
                      className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center border border-[#141414]"
                      style={{ backgroundColor: preset.bg }}
                    >
                      <span
                        className="w-4 h-4 sm:w-3 sm:h-3"
                        style={{ backgroundColor: preset.fg }}
                      />
                    </span>
                    <span className="text-[10px] leading-none">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="g-flabel">Custom colors</p>
            <div className="flex flex-col gap-2 mt-2">
              <label className="flex items-center justify-between gap-3 border border-[#141414] px-3 py-2 sm:px-2.5 sm:py-1.5 cursor-pointer">
                <span className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-6 h-6 border border-black/20 shrink-0"
                    style={{ backgroundColor: fgColor }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em]">
                    Foreground
                  </span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="g-code text-xs">{fgColor}</span>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-7 h-7 sm:w-6 sm:h-6 border border-[#141414] cursor-pointer p-0 bg-white"
                    aria-label="Foreground color"
                  />
                </span>
              </label>
              <label className="flex items-center justify-between gap-3 border border-[#141414] px-3 py-2 sm:px-2.5 sm:py-1.5 cursor-pointer">
                <span className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-6 h-6 border border-black/20 shrink-0"
                    style={{ backgroundColor: bgColor }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em]">
                    Background
                  </span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="g-code text-xs">{bgColor}</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 sm:w-6 sm:h-6 border border-[#141414] cursor-pointer p-0 bg-white"
                    aria-label="Background color"
                  />
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="g-modal-actions px-5 py-4 sm:px-4 sm:py-3 border-t-2 border-[#141414] shrink-0">
          <button
            className="g-btn g-btn-sm"
            onClick={handleDownload}
            disabled={downloading}
          >
            <LuDownload className="w-4 h-4" aria-hidden />
            {downloading ? "Saving…" : "Download PNG"}
          </button>
          <button className="g-btn g-btn-line g-btn-sm" onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default QRCodeModal;
