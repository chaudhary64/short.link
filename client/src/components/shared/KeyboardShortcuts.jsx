import { useEffect } from "react";

const KeyboardShortcuts = () => {
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const urlInput = document.querySelector('input[name="url"]');
        if (urlInput) {
          urlInput.focus();
          urlInput.select();
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return null;
};

export default KeyboardShortcuts;
