import { Stack } from "expo-router";

const PlaylistLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="AccountChooser" />
      <Stack.Screen name="AddAccounts" />
      <Stack.Screen name="CreatePlaylist" />
    </Stack>
  );
};

export default PlaylistLayout;
