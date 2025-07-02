import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  fabricTab: "yarntofabric",
};

const fabrictabSlice = createSlice({
  name: "fabrictab",
  initialState,
  reducers: {
    setFabricTab: (state, action) => {
      state.fabricTab = action.payload;
    },
  },
});

export const { setFabricTab: setFabricTab } = fabrictabSlice.actions;
export default fabrictabSlice.reducer;
