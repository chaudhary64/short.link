import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";

export const generateAvatar = (seed) => {
  return createAvatar(lorelei, {
    seed: seed || "User",
    radius: 50,
  }).toDataUri();
};
