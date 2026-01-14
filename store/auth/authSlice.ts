import { UserAccounts, UserState } from "@/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserState = {
  uid: "",
  email: "",
  displayName: "",
  userAccounts: {},
  status: "checking",
  isLoggedIn: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserBasic: (
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
      state.isLoggedIn = true;
    },

    setUser: (
      state,
      action: PayloadAction<{
        uid: string;
        email: string;
        displayName: string;
        userAccounts: UserAccounts;
      }>
    ) => {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
      state.userAccounts = action.payload.userAccounts;
      state.status = "authenticated";
      state.isLoggedIn = true;
    },

    clearUser: (state) => {
      state.uid = "";
      state.displayName = "";
      state.email = "";
      state.status = "unauthenticated";
      state.userAccounts = {};
      state.isLoggedIn = false;
      state.isLoading = false;
    },

    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
  },
});

export const { setUser, clearUser, setIsLoading, setUserBasic } =
  authSlice.actions;
export default authSlice.reducer;
