import { FirebaseAuth } from "@/firebase/firebaseConfig";
import { clearUser, setUser } from "@/store/auth/authSlice";
import { getUserAccountTokens } from "@/store/auth/authThunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { UserAccounts } from "@/types/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

export const useCheckAuth = () => {
  const { status, isLoggedIn } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  useEffect(() => {
    onAuthStateChanged(FirebaseAuth, async (user) => {
      if (!user) return dispatch(clearUser());

      const { uid, email, displayName } = user;
      const userAccounts: UserAccounts = await getUserAccountTokens(user.uid);
      dispatch(
        setUser({
          uid: uid,
          email: email ?? "",
          displayName: displayName ?? "",
          userAccounts: userAccounts,
        })
      );
    });
  }, []);
  return {
    status,
    isLoggedIn,
  };
};
