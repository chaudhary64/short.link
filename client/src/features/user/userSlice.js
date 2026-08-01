import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
  created_at: null,
  gender: "unknown",
  password_changed_at: null,
  has_password: false,
  has_google: false,
};

const nameSlice = createSlice({
  name: "name",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.created_at = action.payload.created_at ?? null;
      state.gender = action.payload.gender || "unknown";
      state.password_changed_at = action.payload.password_changed_at ?? null;
      state.has_password = action.payload.has_password ?? false;
      state.has_google = action.payload.has_google ?? false;
    },
    removeUserInfo: (state) => {
      state.name = "";
      state.email = "";
      state.created_at = null;
      state.gender = "unknown";
      state.password_changed_at = null;
      state.has_password = false;
      state.has_google = false;
    },
  },
});

export const { setUserInfo, removeUserInfo } = nameSlice.actions;

export default nameSlice.reducer;
