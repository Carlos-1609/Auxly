import { createSlice } from "@reduxjs/toolkit";

type playlistState = {
  tracks: Array<string>;
  profiles: [{}];
};

const initialState: playlistState = {
  tracks: [],
  profiles: [{}],
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState: initialState,
  reducers: {},
});

export default playlistSlice.reducer;
