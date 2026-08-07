import { useDispatch, useSelector } from "react-redux";
import { setToken, removeToken } from "./authSlice";
import { useMemo } from "react";

export function useAuthActions() {
  const dispatch = useDispatch();

  return useMemo(
    () => ({
      setAccessToken: (token) => dispatch(setToken(token)),
      logout: () => dispatch(removeToken()),
    }),
    [dispatch],
  );
}

export function useAuthToken() {
  return useSelector((state) => state.auth.accessToken);
}
