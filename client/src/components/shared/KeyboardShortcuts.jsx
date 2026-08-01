import { useEffect } from "react";

const KeyboardShortcuts = () => {
  useEffect(() => {
    const handler = (e) => {
      // Ctrl/Cmd + K: Focus the page's primary search/URL input
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const urlInput = document.querySelector('input[name="url"]');
        const dashboardSearch = document.querySelector(
          'input[name="dashboard-search"]',
        );
        const target = urlInput || dashboardSearch;
        if (target) {
          target.focus();
          target.select();
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return null;
};

export default KeyboardShortcuts;
