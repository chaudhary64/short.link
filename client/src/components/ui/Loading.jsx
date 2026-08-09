import { useLayoutEffect, useRef } from "react";

const Loading = ({ message = "Loading..." }) => {
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const el = innerRef.current;
    const template = document.getElementById("loader-template");
    if (!el || !template || el.dataset.loaderReady) return;
    el.insertBefore(
      template.content.cloneNode(true),
      el.querySelector(".g-load-msg"),
    );
    el.dataset.loaderReady = "true";
  }, []);

  return (
    <div
      ref={innerRef}
      className="g-load"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <span className="g-load-msg">{message}</span>
    </div>
  );
};

export default Loading;
