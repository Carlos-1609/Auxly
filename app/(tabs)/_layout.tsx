import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Playlists"></Tabs.Screen>
      <Tabs.Screen name="PlaylistHistory"></Tabs.Screen>
    </Tabs>
  );
};

export default TabsLayout;
