const Card = ({ className = "", children }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E8E8EC] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
