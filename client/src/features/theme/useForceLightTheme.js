import { useLayoutEffect } from "react";
import { useTheme } from "./ThemeProvider";

/* Public pages are always light. Lock the palette while the layout is mounted
   and hand the saved app theme back when the visitor enters the dashboard. */
export const useForceLightTheme = () => {
  const { setForceLight } = useTheme();

  useLayoutEffect(() => {
    setForceLight(true);
    return () => setForceLight(false);
  }, [setForceLight]);
};
