// app/index.tsx
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useCheckAuth } from "@/hooks/useCheckAuth";
import { Redirect } from "expo-router";

export default function Index() {
  const { status, isLoggedIn } = useCheckAuth();

  // ⏳ Still checking Firebase session
  if (status === "checking") {
    return <LoadingOverlay visible={true} message="Checking your session..." />;
  }

  // ✅ Already authenticated → go to playlists
  if (isLoggedIn) {
    return <Redirect href="/playlist" />;
  }

  // ❌ No session → go to auth flow
  return <Redirect href="/auth" />;
}
