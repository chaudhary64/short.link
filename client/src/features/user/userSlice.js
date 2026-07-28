import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
  created_at: null,
  gender: "unknown",
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
    },
    getUserInfo: (state) => {
      return {
        name: state.name,
        email: state.email,
        created_at: state.created_at,
        gender: state.gender,
      };
    },
    removeUserInfo: (state) => {
      state.name = "";
      state.email = "";
      state.created_at = null;
      state.gender = "unknown";
    },
  },
});

export const { setUserInfo, getUserInfo, removeUserInfo } = nameSlice.actions;

export default nameSlice.reducer;
