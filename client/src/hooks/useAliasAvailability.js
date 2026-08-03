import { useEffect, useRef, useState } from "react";
import { checkAliasAvailability } from "../api/links";

const DEBOUNCE_MS = 400;

const useAliasAvailability = (alias) => {
  const [result, setResult] = useState(null);
  const [checkedAlias, setCheckedAlias] = useState("");
  const requestIdRef = useRef(0);

  const value = (alias ?? "").trim();

  useEffect(() => {
    if (!value) {
      const t = setTimeout(() => {
        setResult(null);
        setCheckedAlias("");
      }, 0);
      return () => clearTimeout(t);
    }
    if (value === checkedAlias) return;

    const id = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      try {
        const res = await checkAliasAvailability(value);
        if (id !== requestIdRef.current) return;
        setResult(res.data?.available ? "available" : "taken");
        setCheckedAlias(value);
      } catch {
        if (id !== requestIdRef.current) return;
        setResult("error");
        setCheckedAlias(value);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, checkedAlias]);

  if (!value) return "idle";
  if (value === checkedAlias) return result || "checking";
  return "checking";
};

export default useAliasAvailability;
