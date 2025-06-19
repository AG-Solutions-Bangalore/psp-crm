import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  id: null,
  name: null,
  user_type: null,
  email: null,
  token_expire_time: null,
  version: null,
  companyname: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.user_type = action.payload.user_type;
      state.email = action.payload.email;
      state.token_expire_time = action.payload.token_expire_time;
      state.version = action.payload.version;
      state.companyname = action.payload.companyname;
    },
    logout: () => {
      return initialState;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
