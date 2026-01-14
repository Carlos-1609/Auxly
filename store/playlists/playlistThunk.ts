import * as Crypto from "expo-crypto";
import { AppDispatch, RootState } from "../store";

export const generateRandomString = async (length: number) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Get random bytes
  const randomBytes = await Crypto.getRandomBytesAsync(length);

  let text = "";
  for (let i = 0; i < randomBytes.length; i++) {
    text += possible[randomBytes[i] % possible.length];
  }

  return text;
};

export const getCodeVerifier = async () => {
  const code = await generateRandomString(64);
  return code;
};

export const getChallengeFromVerifier = async (verifier: string) => {
  const base64 = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );

  const base64url = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return base64url;
};

export const storeSpotifyTokens = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
    } catch (error) {
      console.log(error);
    }
  };
};
