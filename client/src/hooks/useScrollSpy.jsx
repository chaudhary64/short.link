import { useCallback, useEffect, useRef, useState } from "react";

export const useScrollSpy = (initialSection = "", deps = []) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    const refs = sectionRefs.current;
    Object.values(refs).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps is intentionally dynamic
  }, deps);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const registerSection = useCallback(
    (id) => (el) => {
      sectionRefs.current[id] = el;
    },
    [],
  );

  return { activeSection, scrollToSection, registerSection };
};
