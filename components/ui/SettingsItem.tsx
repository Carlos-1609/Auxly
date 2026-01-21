import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
type SettingsItem = {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

const SettingsItem = (props: SettingsItem) => {
  return (
    <Pressable
      onPress={props.onPress}
      className="bg-bg-card rounded-lg flex-row items-center my-4 py-3 px-4 w-full"
      android_ripple={{ color: "rgba(255,150,113,0.15)" }}
      style={{
        shadowColor: "#FF9671",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <View className="bg-glow-accent/15 rounded-lg p-3">
        <Ionicons name={props.icon as any} size={24} color="orange" />
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-text-primary text-[16px] font-semibold">
          {props.title}
        </Text>
        <Text
          className="text-text-secondary text-[13px]"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {props.subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={22} color="orange" />
    </Pressable>
  );
};

export default SettingsItem;
