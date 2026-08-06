import { generateAvatar } from "../../config/avatar";

const Avatar = ({ seed, fallbackUrl, className = "" }) => {
  const avatarUri = fallbackUrl || generateAvatar(seed);

  return (
    <div
      className={`bg-gray-100 flex items-center justify-center font-bold overflow-hidden ${className}`}
    >
      {avatarUri ? (
        <img
          src={avatarUri}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-400">?</span>
      )}
    </div>
  );
};

export default Avatar;
