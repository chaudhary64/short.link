import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "shortlink-theme";
const ThemeContext = createContext(null);

const systemPrefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const readStored = () => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system"
      ? value
      : "system";
  } catch {
    return "system";
  }
};

const resolve = (preference) =>
  preference === "system"
    ? systemPrefersDark()
      ? "dark"
      : "light"
    : preference;

const apply = (resolved) => {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
};

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(readStored);
  const [resolved, setResolved] = useState(() => resolve(readStored()));

  useEffect(() => {
    apply(resolved);
  }, [resolved]);

  useEffect(() => {
    if (preference !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(query.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  const setTheme = useCallback((next) => {
    const value =
      next === "light" || next === "dark" || next === "system"
        ? next
        : "system";
    setPreference(value);
    setResolved(resolve(value));
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage can be unavailable; the session still switches */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  const value = useMemo(
    () => ({ preference, resolved, setTheme, toggle }),
    [preference, resolved, setTheme, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>.");
  return ctx;
};
