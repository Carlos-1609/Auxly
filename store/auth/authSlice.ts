import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type userState = {
  uid: String;
  email: String;
  displayName: String;
};

const initialState: userState = {
  uid: "",
  email: "",
  displayName: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        uid: string;
        email: string;
        displayName: string;
      }>
    ) => {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
    },
    clearUser: (state) => {
      ((state.uid = ""), (state.displayName = ""), (state.email = ""));
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
