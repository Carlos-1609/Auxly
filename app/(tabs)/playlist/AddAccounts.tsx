import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { connectSpotifyAccount } from "@/store/auth/authThunk";
import {
  setContributingAccounts,
  toggleContributingAccount,
} from "@/store/playlists/playlistSlice";
import {
  disconnectSpotifyAccount,
  validateAllSpotifyAccounts,
} from "@/store/playlists/playlistThunk";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type AccountRow = {
  id: string;
  displayName: string;
  isPrimary: boolean;
};

const AddAccounts = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const spotify = useAppSelector((s) => s.auth.userAccounts.spotify);
  const contributingIds = useAppSelector(
    (s) => s.playlist.draft.contributingAccountIds
  );
  const accountHealth = useAppSelector((s) => s.playlist.accountHealth);

  const [showMusicAccounts, setShowMusicAccounts] = useState(false);
  const [pendingDisconnectId, setPendingDisconnectId] = useState<string | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);

  // Sorted list: primary first, then secondaries by display name.
  const accounts: AccountRow[] = useMemo(() => {
    return Object.entries(spotify.accounts)
      .map(([id, acc]) => ({
        id,
        displayName: acc.displayName,
        isPrimary: id === spotify.primaryId,
      }))
      .sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
        return a.displayName.localeCompare(b.displayName);
      });
  }, [spotify.accounts, spotify.primaryId]);

  // Seed contributors with [primaryId] on first mount so the user doesn't
  // have to remember to include their own account.
  useEffect(() => {
    if (contributingIds.length === 0 && spotify.primaryId) {
      dispatch(setContributingAccounts([spotify.primaryId]));
    }
    // We only want this on mount-when-empty. Once the user has interacted,
    // their selection is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Probe every linked account each time the screen comes into focus.
  // useFocusEffect re-fires after navigating back to AddAccounts, unlike
  // useEffect which wouldn't run again because expo-router keeps the screen
  // mounted.
  useFocusEffect(
    useCallback(() => {
      dispatch(validateAllSpotifyAccounts());
    }, [dispatch])
  );

  // Also re-probe when the app returns from the background. Catches the case
  // where the user backgrounded the simulator/app, revoked access from another
  // device or the web, then came back.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        dispatch(validateAllSpotifyAccounts());
      }
    });
    return () => sub.remove();
  }, [dispatch]);

  // If a previously-selected contributor turns out to be dead, drop it from
  // the selection so the Next button reflects reality.
  useEffect(() => {
    const stillUsable = contributingIds.filter(
      (id) => accountHealth[id] !== "needs_reauth"
    );
    if (stillUsable.length !== contributingIds.length) {
      dispatch(setContributingAccounts(stillUsable));
    }
  }, [accountHealth, contributingIds, dispatch]);

  const nextDisabled = contributingIds.length === 0;

  const handleAddSecondary = async () => {
    setShowMusicAccounts(false);
    await dispatch(connectSpotifyAccount("0"));
    // Linking.openURL inside the thunk hands control to the browser;
    // the callback screen handles the rest.
  };

  const handleConfirmDisconnect = async () => {
    if (!pendingDisconnectId) return;
    await dispatch(disconnectSpotifyAccount(pendingDisconnectId));
    setPendingDisconnectId(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(validateAllSpotifyAccounts());
    setRefreshing(false);
  };

  const handleRelink = async (accountId: string) => {
    const isPrimary = accountId === spotify.primaryId;
    await dispatch(
      connectSpotifyAccount(isPrimary ? "1" : "0", { forceShowDialog: true })
    );
    // OAuth takes over; the callback re-fires linkSpotifyAccount which
    // overwrites spotify.accounts[id] when the same Spotify user signs in.
  };

  return (
    <SafeAreaView className="bg-bg-base flex-1">
      <View className="flex-row justify-between mt-2 mb-2">
        <Pressable className="mx-4" onPress={() => router.back()}>
          <Text className="text-error font-bold text-[17px]">Back</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/playlist/CreatePlaylist")}
          className="mx-4"
          disabled={nextDisabled}
        >
          <Text
            className={`${nextDisabled ? "text-success/30" : "text-success"} font-bold text-[17px]`}
          >
            Next
          </Text>
        </Pressable>
      </View>

      <View className="mx-5 mt-2 mb-4">
        <Text className="text-text-primary text-xl font-bold">
          Pick contributors
        </Text>
        <Text className="text-text-muted mt-1">
          Their top tracks will be merged into your playlist.
        </Text>
      </View>

      {accounts.length > 0 ? (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => {
            const included = contributingIds.includes(item.id);
            const health = accountHealth[item.id] ?? "unknown";
            const isDead = health === "needs_reauth";
            const isChecking = health === "checking";

            const subtitle = isDead
              ? "Re-link needed"
              : isChecking
                ? "Checking…"
                : included
                  ? "Included"
                  : "Tap to include";

            return (
              <Pressable
                onPress={() =>
                  !isDead && dispatch(toggleContributingAccount(item.id))
                }
                disabled={isDead}
                className={`bg-bg-card rounded-xl p-4 mx-5 ${
                  isDead
                    ? "border-2 border-error/50 opacity-70"
                    : included
                      ? "border-2 border-success"
                      : "border-2 border-transparent"
                }`}
                style={{
                  shadowColor: "#000000",
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                }}
              >
                <View className="flex-row items-center gap-x-4">
                  <FontAwesome5 name="spotify" size={30} color="#1DB954" />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-x-2">
                      <Text className="text-text-primary font-medium">
                        {item.displayName}
                      </Text>
                      {item.isPrimary ? (
                        <View className="bg-gold/20 px-2 py-0.5 rounded">
                          <Text className="text-gold text-xs font-bold">
                            PRIMARY
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text
                      className={`text-sm ${isDead ? "text-error" : "text-text-muted"}`}
                    >
                      {subtitle}
                    </Text>
                  </View>

                  {isDead ? (
                    <Pressable
                      onPress={() => handleRelink(item.id)}
                      className="bg-gold/20 px-3 py-1.5 rounded-md border border-gold/40"
                    >
                      <Text className="text-gold font-bold text-xs">
                        Re-link
                      </Text>
                    </Pressable>
                  ) : isChecking ? (
                    <ActivityIndicator size="small" color="#8A8A8A" />
                  ) : (
                    <Ionicons
                      name={included ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={included ? "#72E0A8" : "#8A8A8A"}
                    />
                  )}

                  {!item.isPrimary ? (
                    <Pressable
                      hitSlop={10}
                      onPress={() => setPendingDisconnectId(item.id)}
                    >
                      <FontAwesome5 name="trash-alt" size={18} color="#EF4444" />
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#FFD580"
              colors={["#FFD580"]}
            />
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-text-primary text-lg text-center">
            No Spotify accounts linked yet
          </Text>
          <Text className="text-text-muted text-center mt-1">
            Link a primary account from the Profile tab first.
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => setShowMusicAccounts(true)}
        className="h-[58px] w-[58px] rounded-full items-center justify-center absolute right-6 bg-gold"
        style={{
          bottom: insets.bottom + 5,
          shadowColor: "#FF9671",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.5,
          shadowRadius: 9,
          elevation: 10,
        }}
        android_ripple={{ color: "rgba(255,255,255,0.18)", borderless: true }}
        accessibilityRole="button"
        accessibilityLabel="Add another account"
      >
        <FontAwesome5 name="plus" size={22} color="#111" />
      </Pressable>

      {showMusicAccounts ? (
        <View className="absolute inset-0 items-center justify-center">
          <Pressable
            onPress={() => setShowMusicAccounts(false)}
            className="absolute inset-0 bg-black/50"
          />

          <View className="bg-bg-card w-[320px] rounded-2xl px-4 pt-4 pb-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-text-primary text-lg font-bold">
                Add a contributor
              </Text>
              <Pressable
                onPress={() => setShowMusicAccounts(false)}
                hitSlop={12}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-warning"
              >
                <Text className="text-warning text-xl">×</Text>
              </Pressable>
            </View>

            <Text className="text-text-secondary mt-1 text-sm">
              They'll sign into their account and we'll pull their top tracks.
            </Text>

            <View className="mt-4 gap-y-4">
              <Pressable
                onPress={handleAddSecondary}
                className="rounded-xl bg-[#1DB954] px-4 py-3 flex-row items-center justify-center gap-x-2"
              >
                <FontAwesome5 name="spotify" size={26} color="black" />
                <Text className="text-black text-[16px] font-bold">Spotify</Text>
              </Pressable>

              <Pressable
                disabled
                className="rounded-xl bg-[#FA2D48]/40 px-4 py-3 flex-row items-center justify-center gap-x-2"
              >
                <FontAwesome5 name="apple" size={28} color="white" />
                <Text className="text-white text-[16px] font-bold mt-1">
                  Apple (soon)
                </Text>
              </Pressable>

              <Pressable
                disabled
                className="rounded-xl bg-[#FF9900]/40 px-4 py-3 flex-row items-center justify-center gap-x-2"
              >
                <FontAwesome5 name="amazon" size={26} color="black" />
                <Text className="text-black text-[16px] font-bold">
                  Amazon (soon)
                </Text>
              </Pressable>

              <Pressable
                disabled
                className="rounded-xl bg-[#FF0000]/40 px-4 py-3 flex-row items-center justify-center gap-x-2"
              >
                <FontAwesome5 name="youtube" size={26} color="white" />
                <Text className="text-white text-[16px] font-bold">
                  YouTube (soon)
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {pendingDisconnectId ? (
        <View className="absolute inset-0 justify-center items-center bg-black/50">
          <View className="bg-bg-card rounded-2xl w-[280px] overflow-hidden">
            <View className="px-6 pt-8 pb-6">
              <Text className="text-text-primary text-center text-[16px] leading-5 font-bold">
                Remove this account?
              </Text>
            </View>
            <View className="h-[0.5px] bg-gray-700" />
            <Pressable
              onPress={handleConfirmDisconnect}
              className="py-3.5"
              android_ripple={{ color: "rgba(255, 107, 107, 0.15)" }}
            >
              <Text className="text-error text-center text-[15px] font-bold">
                Remove
              </Text>
            </Pressable>
            <View className="h-[0.5px] bg-gray-700" />
            <Pressable
              onPress={() => setPendingDisconnectId(null)}
              className="py-3.5"
              android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
            >
              <Text className="text-text-primary text-center text-[15px] font-bold">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default AddAccounts;
