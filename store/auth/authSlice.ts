import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type userState = {
  uid: String;
  email: String;
  displayName: String;
  status: String;
  isLoading: boolean;
};

const initialState: userState = {
  uid: "",
  email: "",
  displayName: "",
  status: "checking",
  isLoading: false,
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
      state.status = "authenticated";
    },
    clearUser: (state) => {
      ((state.uid = ""),
        (state.displayName = ""),
        (state.email = ""),
        (state.status = "unauthenticated"));
    },
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
  },
});

export const { setUser, clearUser, setIsLoading } = authSlice.actions;
export default authSlice.reducer;
