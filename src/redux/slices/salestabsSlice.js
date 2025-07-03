import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  salesTab: "sales", 
};

const salestabSlice = createSlice({
  name: "salestab",
  initialState,
  reducers: {
    setSalesTab: (state, action) => {
      state.salesTab = action.payload;
    },
  },
});

export const { setSalesTab: setSalesTab } = salestabSlice.actions;
export default salestabSlice.reducer;
