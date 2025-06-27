import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rawMaterialTab: "stock",
};

const tabSlice = createSlice({
  name: "tab",
  initialState,
  reducers: {
    setRawMaterialTab: (state, action) => {
      state.rawMaterialTab = action.payload;
    },
  },
});

export const { setRawMaterialTab } = tabSlice.actions;
export default tabSlice.reducer;
