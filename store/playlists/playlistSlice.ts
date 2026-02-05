import { createSlice } from "@reduxjs/toolkit";

type playlistState = {
  profiles: [{}];
  primaryProfile: {};
  playlistName: string;
  playlistID: string;
};

const initialState: playlistState = {
  profiles: [{}],
  primaryProfile: {},
  playlistName: "",
  playlistID: "",
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState: initialState,
  reducers: {},
});

export default playlistSlice.reducer;
