import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
  created_at: null,
};

const nameSlice = createSlice({
  name: "name",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.created_at = action.payload.created_at ?? null;
    },
    getUserInfo: (state) => {
      return {
        name: state.name,
        email: state.email,
        created_at: state.created_at,
      };
    },
    removeUserInfo: (state) => {
      state.name = "";
      state.email = "";
      state.created_at = null;
    },
  },
});

export const { setUserInfo, getUserInfo, removeUserInfo } = nameSlice.actions;

export default nameSlice.reducer;
