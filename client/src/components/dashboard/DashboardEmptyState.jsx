const DashboardEmptyState = () => {
  return (
    <div className="g-empty">
      <div className="g-empty-glyph">□</div>
      <h2 className="g-empty-title">No links yet</h2>
      <p className="g-empty-sub">
        Your first short link will appear here. Click{" "}
        <span className="font-bold text-[#141414]">Create Link</span> above to
        get started.
      </p>
    </div>
  );
};

export default DashboardEmptyState;
