import { useCheckAuth } from "@/hooks/useCheckAuth";
import { Redirect, Tabs, useRouter } from "expo-router";

const TabsLayout = () => {
  const { status, isLoggedIn } = useCheckAuth();
  const router = useRouter();

  if (!isLoggedIn) {
    console.log("Please signin first okay");
    return <Redirect href="/auth/SignIn" />;
  }
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen name="Playlists"></Tabs.Screen>
      </Tabs.Protected>
      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen name="PlaylistHistory"></Tabs.Screen>
      </Tabs.Protected>
    </Tabs>
  );
};

export default TabsLayout;
