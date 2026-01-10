import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import playlistReducer from "./playlists/playlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    playlist: playlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
