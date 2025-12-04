import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, Text, View } from "react-native";
import AuxlyWaveLoader from "./AuxlyWaveLoader";

type Props = {
  visible: boolean;
  message?: string;
};

export default function LoadingOverlay({ visible, message }: Props) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50 items-center justify-center">
      {/* Blurred background */}
      <BlurView intensity={40} tint="dark" className="absolute inset-0" />

      {/* Blocks touch interactions */}
      <Pressable className="absolute inset-0" disabled />

      {/* Loader */}
      <View className="items-center justify-center">
        <AuxlyWaveLoader
          width={200}
          height={140}
          baseColor="#2A2A2E"
          highlightColor="#F6C96D"
          bars={7}
          durationMs={1400}
        />

        {message && (
          <Text className="text-white/80 mt-4 text-base font-semibold">
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}
