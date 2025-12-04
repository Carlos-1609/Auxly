import { BlurView } from "expo-blur";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  ModalProps,
  Platform,
  Pressable,
  View,
} from "react-native";

type PROPS = ModalProps & {
  isOpen: boolean;
  withinInput?: boolean;
  onBackdropPress?: () => void;
  blurIntensity?: number; // 0–100
  scrimOpacity?: number; // 0–1
};

const EmailModal = ({
  isOpen,
  withinInput,
  children,
  onBackdropPress,
  blurIntensity = 40,
  scrimOpacity = 0.45,
  ...rest
}: PROPS) => {
  const Wrapper = withinInput ? KeyboardAvoidingView : View;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      {...rest}
    >
      {/* Fullscreen container */}
      <View className="flex-1 items-center justify-center">
        {/* BLUR LAYER */}
        <BlurView
          tint="dark"
          intensity={blurIntensity}
          className="absolute inset-0"
        />

        {/* SCRIM LAYER */}
        <Pressable
          onPress={onBackdropPress}
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0,0,0,${scrimOpacity})`,
          }}
        />

        {/* CONTENT */}
        <Wrapper
          className="px-3 w-full items-center justify-center"
          behavior={withinInput && Platform.OS === "ios" ? "padding" : "height"}
        >
          {children}
        </Wrapper>
      </View>
    </Modal>
  );
};

export default EmailModal;
