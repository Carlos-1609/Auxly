import "../global.css";

//import toastConfig from "@/components/ui/ToastConfig";
import toastConfig from "@/components/ui/ToastConfig";
import { Slot } from "expo-router";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { store } from "../store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Slot />
      <Toast config={toastConfig} />
    </Provider>
  );
}
