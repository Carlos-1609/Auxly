// components/CustomTabBar.tsx
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  return (
    // Bottom strip background (behind the pill)
    <View className="bg-bg-base pt-3">
      {/* Pill container */}
      <View className="mx-5 mb-7 flex-row items-center rounded-2xl bg-bg-card px-4 py-3 shadow-soft">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          const label = options.tabBarLabel ?? options.title ?? route.name;

          const isFocused = state.index === index;

          // Use your theme colors
          const color = isFocused
            ? "#72E0A8" /* success */
            : "#8A8A8A"; /* text-muted */

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
                isFocused ? "bg-bg-input rounded-xl" : ""
              }`}
            >
              {/* Icon from Tabs.Screen options */}
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color,
                  size: 22,
                })}

              {/* Label */}
              <Text
                className={`mt-1 text-[11px] ${
                  isFocused ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {label as string}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;
