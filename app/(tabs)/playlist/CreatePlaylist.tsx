import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CreatePlaylist = () => {
  return (
    <SafeAreaView>
      <Text className="text-text-primary text-lg text-center">
        Choose an Account to create the Playlist
      </Text>
    </SafeAreaView>
  );
};

export default CreatePlaylist;
