import { useDispatch } from "react-redux";
import { removeUserInfo, setUserInfo } from "./userSlice";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export function useUserActions() {
  const dispatch = useDispatch();

  return useMemo(() => ({
    setUserInfo: (userInfo) => dispatch(setUserInfo(userInfo)),
    removeUserInfo: () => dispatch(removeUserInfo()),
  }), [dispatch]);
}

export function useUserInfo() {
  return useSelector((state) => state.user);
}
