import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Props = {
  width?: number;
  height?: number;
  baseColor?: string;
  highlightColor?: string;
  bars?: number;
  durationMs?: number;
};

const DEFAULT_WIDTH = 240;
const DEFAULT_HEIGHT = 120;

/**
 * AuxlyWaveLoader (Horizontal)
 * Same as original, but flipped so bars go left ↔ right.
 */
export default function AuxlyWaveLoader({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  baseColor = "#2A2A2E",
  highlightColor = "#F6C96D",
  bars = 7,
  durationMs = 1400,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(bars - 1, { duration: durationMs, easing: Easing.linear }),
      -1,
      false,
    );
  }, [bars, durationMs]);

  // Precompute heights instead of widths (we're rotating)
  const heights = Array.from({ length: bars }, (_, i) => {
    const pct =
      0.45 + 0.55 * Math.cos(((i - (bars - 1) / 2) / (bars / 2)) * Math.PI);
    return Math.round(height * pct);
  });

  const gap = width / (bars * 2.0);
  const barWidth = (width - gap * (bars - 1)) / bars;

  return (
    <View
      style={{
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row", //  this is the key — side by side instead of vertical
      }}
    >
      {heights.map((h, i) => {
        const style = useAnimatedStyle(() => {
          const d = i - t.value;
          const sigma = 0.9;
          const intensity = Math.exp(-(d * d) / (2 * sigma * sigma));

          const bg = interpolateColor(
            intensity,
            [0, 1],
            [baseColor, highlightColor],
          );
          const scale = interpolate(intensity, [0, 1], [1, 1.04]);
          const shadowOpacity = interpolate(intensity, [0, 1], [0.15, 0.45]);
          const shadowRadius = interpolate(intensity, [0, 1], [2, 6]);

          return {
            backgroundColor: bg,
            transform: [{ scale }],
            shadowOpacity,
            shadowRadius,
          };
        });

        return (
          <Animated.View
            key={i}
            style={[
              {
                width: barWidth,
                height: h,
                marginRight: i === bars - 1 ? 0 : gap,
                borderRadius: barWidth,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
              },
              style,
            ]}
          />
        );
      })}
    </View>
  );
}
