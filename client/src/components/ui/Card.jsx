const Card = ({ className = "", children }) => {
  return (
    <div className={`bg-white rounded-none border border-gray-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
