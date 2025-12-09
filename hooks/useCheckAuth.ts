import { FirebaseAuth } from "@/firebase/firebaseConfig";
import { clearUser, setUser } from "@/store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

export const useCheckAuth = () => {
  const { status, isLoggedIn } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  useEffect(() => {
    onAuthStateChanged(FirebaseAuth, async (user) => {
      if (!user) return dispatch(clearUser());

      const { uid, email, displayName } = user;
      dispatch(
        setUser({
          uid: uid,
          email: email ?? "",
          displayName: displayName ?? "",
        })
      );
    });
  }, []);
  return {
    status,
    isLoggedIn,
  };
};
