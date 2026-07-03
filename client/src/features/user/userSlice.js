import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
};

const nameSlice = createSlice({
  name: "name",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
    getUserInfo: (state) => {
      return {
        name: state.name,
        email: state.email,
      };
    },
    removeUserInfo: (state) => {
      state.name = "";
      state.email = "";
    },
  },
});

export const { setUserInfo, getUserInfo, removeUserInfo } = nameSlice.actions;

export default nameSlice.reducer;
