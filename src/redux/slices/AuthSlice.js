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
  companystatename: null,
  company_address: null,
  company_email: null,
  company_gst: null,
  company_mobile: null,
  company_state_code: null,
  company_state_name: null,
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
      state.companystatename = action.payload.companystatename;
      state.company_address = action.payload.company_address;
      state.company_email = action.payload.company_email;
      state.company_gst = action.payload.company_gst;
      state.company_mobile = action.payload.company_mobile;
      state.company_state_code = action.payload.company_state_code;
      state.company_state_name = action.payload.company_state_name;
    },
    logout: () => {
      return initialState;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
