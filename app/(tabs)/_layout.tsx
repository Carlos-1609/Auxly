import CustomTabBar from "@/components/CustomTabBar";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useCheckAuth } from "@/hooks/useCheckAuth";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, useSegments } from "expo-router";

const TabsLayout = () => {
  const { status, isLoggedIn } = useCheckAuth();
  const segments = useSegments();
  // segments example:
  // ["(tabs)", "profile"]                    -> profile tab (show)
  // ["(tabs)", "profile", "account-settings"] -> nested (hide)
  const hideTabBar = segments[1] === "profile" && segments.length > 2;

  if (status === "checking") {
    console.log("Checking your session!");
    return <LoadingOverlay visible={true} message="Checking your session..." />;
  }

  if (!isLoggedIn) {
    console.log("Please signin first okay");
    console.log(status);

    return <Redirect href="/auth/SignIn" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: hideTabBar
          ? { display: "none" }
          : {
              position: "absolute",
              backgroundColor: "transparent",
              borderTopWidth: 0,
              elevation: 0,
            },
      }}
      tabBar={(props) => (hideTabBar ? null : <CustomTabBar {...props} />)}
    >
      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen
          name="Playlists"
          options={{
            title: "Playlists",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "musical-notes" : "musical-notes-outline"}
                size={size ?? 22}
                color={color}
              />
            ),
          }}
        />
      </Tabs.Protected>

      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen
          name="PlaylistHistory"
          options={{
            title: "History",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "time" : "time-outline"}
                size={size ?? 22}
                color={color}
              />
            ),
          }}
        />
      </Tabs.Protected>

      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size ?? 22}
                color={color}
              />
            ),
          }}
        />
      </Tabs.Protected>
    </Tabs>
  );
};

export default TabsLayout;
