import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { encryptTransform } from "redux-persist-transform-encrypt";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/AuthSlice";
import sidebarReducer from "./slices/sidebarSlice";
import versionReducer from "./slices/versionSlice";
import tabReducer from "./slices/rawtabSlice";
import granualtabReducer from "./slices/granualstabSlice";
import salestabReducer from "./slices/salestabsSlice";
import fabrictabReducer from "./slices/fabrictabSlice";
import yarntabReducer from "./slices/yarntabSlice";
const secretKey = import.meta.env.VITE_SECRET_KEY;

let transforms = [];

if (!secretKey) {
  console.warn(
    "❌ Missing SECRET_KEY — AppInitializer will handle redirection."
  );
} else {
  transforms.push(
    encryptTransform({
      secretKey,
      onError: (error) => console.error("Encryption Error:", error),
    })
  );
}

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "columnVisibility"],
  transforms,
};

const rootReducer = combineReducers({
  auth: authReducer,
  sidebar: sidebarReducer,
  version: versionReducer,
  tab: tabReducer,
  granualtab: granualtabReducer,
  salestab: salestabReducer,
  fabrictab: fabrictabReducer,
  yarntab: yarntabReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

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
