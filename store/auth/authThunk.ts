import { FirebaseDB } from "@/firebase/firebaseConfig";
import { userSignInFirebase, userSignUpFirebase } from "@/firebase/providers";
import { UserAccounts } from "@/types/auth";
import { doc, getDoc } from "firebase/firestore";
import { AppDispatch, RootState } from "../store";
import { setIsLoading, setUser } from "./authSlice";

export const startUserSignUp = (data: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      console.log("Inside the dispatch");
      dispatch(setIsLoading(true));
      const user = await userSignUpFirebase(data);
      if (!user?.uid) {
        dispatch(setIsLoading(false));
        return false;
      }
      dispatch(
        setUser({
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? "",
          userAccounts: {},
        })
      );
      dispatch(setIsLoading(false));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
};

export const startUserSignin = (email: string, password: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch(setIsLoading(true));
      const user = await userSignInFirebase(email, password);
      if (!user?.uid) {
        dispatch(setIsLoading(false));
        return false;
      }
      const userAccounts: UserAccounts = await getUserAccountTokens(user.uid);
      dispatch(
        setUser({
          uid: user.uid,
          displayName: user.displayName ?? "",
          email: user.email ?? "",
          userAccounts: userAccounts,
        })
      );
      console.log(JSON.stringify({ user, userAccounts }, null, 2));
      return {
        ok: true,
      };
    } catch (error) {
      console.log("Inside the thunk");
      console.error("This was the sign in error: /n", error);
      dispatch(setIsLoading(false));
      return false;
    }
  };
};

export const getUserAccountTokens = async (id: string) => {
  try {
    const docRef = doc(FirebaseDB, "userAccounts", id);
    const query = await getDoc(docRef);
    let userAccounts: UserAccounts;
    if (query.exists()) {
      //console.log("Si existe");
      userAccounts = query.data();
      return userAccounts;
    } else {
      //console.log("No existe");
      userAccounts = {};
      return userAccounts;
    }
  } catch (error) {
    console.log(error);
    return {};
  }
};
