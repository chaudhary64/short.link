import { useDispatch } from "react-redux";
import { removeUserInfo, setUserInfo } from "./userSlice";
import { useSelector } from "react-redux";

export function useUserActions() {
  const dispatch = useDispatch();

  return {
    setUserInfo: (userInfo) => dispatch(setUserInfo(userInfo)),
    removeUserInfo: () => dispatch(removeUserInfo()),
  };
}

export function useUserInfo() {
  return useSelector((state) => state.user);
}
