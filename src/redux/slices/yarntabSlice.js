import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  yarnTab: "yarnstock",
};

const yarntabSlice = createSlice({
  name: "yarntab",
  initialState,
  reducers: {
    setYarnTab: (state, action) => {
      state.yarnTab = action.payload;
    },
  },
});

export const { setYarnTab: setYarnTab } = yarntabSlice.actions;
export default yarntabSlice.reducer;
