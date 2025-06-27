// redux/slices/granualstabSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  granualsTab: "stock", 
};

const granualtabSlice = createSlice({
  name: "granualtab",
  initialState,
  reducers: {
    setGranualsTab: (state, action) => {
      state.granualsTab = action.payload;
    },
  },
});

export const { setGranualsTab } = granualtabSlice.actions;
export default granualtabSlice.reducer;
