import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { AccountMenu } from "@/features/account/components/AccountMenu";
import { ProfileHeader } from "@/features/account/components/ProfileHeader";
import { QuickStats } from "@/features/account/components/QuickStats";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { calculateProfileCompletion } from "@/features/account/utils/profileCompletion";
import { getAverageRating } from "@/services/communityStore";
import React from "react";
import { appTheme as theme } from "@/theme/appTheme";

import { router, useFocusEffect } from "expo-router";

import { ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const { user, refreshUser } = useAuth();
  const {
    displayName,
    farmName,
    farmAddress,
    profilePhotoUri,
    hasNewMessages,
    logout,
    refreshProfileData,
  } = useAccountLogic();

  const { percentage } = calculateProfileCompletion(user);
  const averageRating = user ? getAverageRating(user.username, "producer") : 0;
  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
      refreshProfileData();
    }, [refreshUser, refreshProfileData])
  );

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.primary}
          translucent={false}
        />
        <AppHeader
          title="Central"
          onBackPress={() => {}}
          showBackButton={false}
          titleAlign="center"
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          borderColor={theme.colors.gray_200}
        />

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <ProfileHeader
            displayName={displayName}
            farmName={farmName}
            farmAddress={farmAddress}
            profilePhotoUri={profilePhotoUri}
            onPressEditProfile={() => router.push("/edit-profile")}
          />

          {/* Status */}
          <QuickStats
            rating={averageRating}
            completeness={percentage}
            onPressRating={() => router.push("/ratings")}
            onPressCompleteness={() => router.push("/profile-completion")}
          />

          <AccountMenu hasNewMessages={hasNewMessages} onLogout={logout} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
});
