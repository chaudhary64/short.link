const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="g-load" role="status" aria-live="polite" aria-label={message}>
      <span className="g-mark g-load-c1" aria-hidden="true"></span>
      <span className="g-mark g-load-c2" aria-hidden="true"></span>
      <span className="g-mark g-load-c3" aria-hidden="true"></span>
      <span className="g-mark g-load-c4" aria-hidden="true"></span>
      <span className="g-load-mark" aria-hidden="true"></span>
      <span className="g-load-msg">{message}</span>
    </div>
  );
};

export default Loading;
