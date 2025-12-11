import { userSignInFirebase, userSignUpFirebase } from "@/firebase/providers";
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
      dispatch(
        setUser({
          uid: user.uid,
          displayName: user.displayName ?? "",
          email: user.email ?? "",
        })
      );
      console.log(JSON.stringify(user, null, 2));
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

// export const sendEmailResetPassword = (email: string) => {
//   return async (dispatch: AppDispatch, getState: () => RootState) => {
//     try {
//       const res = await userPasswordResetFirebase(email);
//       console.log(res.response);
//       if (!res.ok) {
//         console.log(res.errorMessage);
//         return false;
//       }
//       return true;
//     } catch (error) {
//       console.error(error);
//       return false;
//     }
//   };
// };
