import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type userState = {
  uid: string;
  email: string;
  displayName: string;
  status: string;
  isLoading: boolean;
  isLoggedIn: boolean;
};

const initialState: userState = {
  uid: "",
  email: "",
  displayName: "",
  status: "checking",
  isLoggedIn: false,
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
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      ((state.uid = ""),
        (state.displayName = ""),
        (state.email = ""),
        (state.status = "unauthenticated"),
        (state.isLoggedIn = false),
        (state.isLoading = false));
    },
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
  },
});

export const { setUser, clearUser, setIsLoading } = authSlice.actions;
export default authSlice.reducer;
