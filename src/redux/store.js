import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { encryptTransform } from "redux-persist-transform-encrypt";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/AuthSlice";
import sidebarReducer from "./slices/sidebarSlice";
import versionReducer from "./slices/versionSlice";
const encryptor = encryptTransform({
  secretKey: import.meta.env.VITE_SECRET_KEY || "",
  onError: (error) => console.error("Encryption Error:", error),
});
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "columnVisibility"],
  transforms: [encryptor],
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  sidebar: sidebarReducer,
  version: versionReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PURGE",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
