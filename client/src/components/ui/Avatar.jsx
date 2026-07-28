import { generateAvatar } from "../../config/avatar";

const Avatar = ({ seed, fallbackUrl, className = "" }) => {
  const avatarUri = fallbackUrl || generateAvatar(seed);

  return (
    <div
      className={`w-10 h-10 bg-gray-100 flex items-center justify-center font-bold rounded-none overflow-hidden border border-gray-200 ${className}`}
    >
      {avatarUri ? (
        <img
          src={avatarUri}
          alt="Avatar"
          className="w-full h-full object-cover rounded-none"
        />
      ) : (
        <span className="text-gray-400">?</span>
      )}
    </div>
  );
};

export default Avatar;
