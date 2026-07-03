const Avatar = ({ initials, fallbackUrl, className = "" }) => {
  return (
    <div
      className={`w-10 h-10 bg-gray-900 text-white flex items-center justify-center font-bold rounded-none ${className}`}
    >
      {fallbackUrl ? (
        <img
          src={fallbackUrl}
          alt="Avatar"
          className="w-full h-full object-cover rounded-none"
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default Avatar;
