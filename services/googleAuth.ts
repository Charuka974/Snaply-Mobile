import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useAuthRequest } from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebase";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    // @ts-ignore
    useProxy: true,
    projectNameForProxy: "@gourmetDelight/snaply-mobile",
  });

  // console.log("Redirect URI:", redirectUri);

  const [request, response, promptAsync] = useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    redirectUri,
    responseType: "id_token",
    scopes: ["profile", "email"],
  });

  const signInWithGoogle = async () => {
    const result = await promptAsync({ 
      // @ts-ignore
      useProxy: true,
      projectNameForProxy: "@gourmetDelight/snaply-mobile", 
    });

    if (result?.type !== "success") {
      throw new Error("Google login canceled");
    }

    const { id_token } = result.params;
    if (!id_token) {
      throw new Error("No ID token returned from Google");
    }

    const credential = GoogleAuthProvider.credential(id_token);
    const userCredential = await signInWithCredential(auth, credential);

    return userCredential.user;
  };

  return { signInWithGoogle };
};
