import { FirebaseAuth } from "@/firebase/firebaseConfig";
import { clearUser, setUser } from "@/store/auth/authSlice";
import { getUserAccountTokens } from "@/store/auth/authThunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { UserAccounts } from "@/types/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

// Mount ONCE at the root layout. Returns an unsubscribe so the listener
// doesn't accumulate on remounts.
export const useAuthListener = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FirebaseAuth, async (user) => {
      if (!user) {
        dispatch(clearUser());
        return;
      }
      const userAccounts: UserAccounts = await getUserAccountTokens(user.uid);
      dispatch(
        setUser({
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? "",
          userAccounts,
        }),
      );
    });
    return unsubscribe;
  }, [dispatch]);
};

// Read-only selector for any screen/layout that needs to gate on auth state.
// Uses scalar selectors so each subscription compares by reference correctly
// a composite object literal here would re-render on every store change
export const useCheckAuth = () => {
  const status = useAppSelector((state) => state.auth.status);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  return { status, isLoggedIn };
};
