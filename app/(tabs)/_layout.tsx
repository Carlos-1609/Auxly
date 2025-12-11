import CustomTabBar from "@/components/CustomTabBar";
import { useCheckAuth } from "@/hooks/useCheckAuth";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

const TabsLayout = () => {
  const { status, isLoggedIn } = useCheckAuth();

  if (!isLoggedIn) {
    console.log("Please signin first okay");
    return <Redirect href="/auth/SignIn" />;
  }
  //#1B1A1E

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          elevation: 0,
          borderTopWidth: 0,
          position: "absolute",
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
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
          name="Profile"
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
