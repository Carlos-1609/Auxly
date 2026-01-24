// components/CustomTabBar.tsx
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Pressable, Text, View } from "react-native";

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 pt-3">
      {/* BlurView as the pill container */}
      <BlurView
        intensity={60}
        tint="dark" // or "light", "default", "extraLight"
        className="mx-5 mb-7 flex-row items-center rounded-2xl px-4 py-3 overflow-hidden"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} // Optional: add slight tint
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          const label = options.tabBarLabel ?? options.title ?? route.name;

          const isFocused = state.index === index;

          const color = isFocused
            ? "#fb923c" /* success */
            : "#FFD580"; /* text-muted */

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className={`flex-1 items-center py-1 ${
                isFocused ? "bg-gold/10 rounded-xl" : ""
              }`}
            >
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color,
                  size: 22,
                })}

              <Text
                className={`mt-1 text-[11px] ${
                  isFocused ? "text-text-primary font-bold" : "text-text-muted"
                }`}
              >
                {label as string}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
};

export default CustomTabBar;
