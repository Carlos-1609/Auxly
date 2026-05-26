import "../global.css";

import toastConfig from "@/components/ui/ToastConfig";
import { useAuthListener } from "@/hooks/useCheckAuth";
import { Slot } from "expo-router";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { store } from "../store/store";

function AuthGate({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthGate>
        <Slot />
      </AuthGate>
      <Toast config={toastConfig} />
    </Provider>
  );
}
