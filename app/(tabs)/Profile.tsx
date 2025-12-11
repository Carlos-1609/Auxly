import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  return (
    <SafeAreaView
      edges={["top"]}
      className="bg-bg-base flex-1 items-center justify-start"
    >
      <Text>This is the profile screen</Text>
    </SafeAreaView>
  );
};

export default Profile;
