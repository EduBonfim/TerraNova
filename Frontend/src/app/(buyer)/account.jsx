import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { BuyerAccountMenu } from "@/features/account/components/BuyerAccountMenu";
import { BuyerProfileHeader } from "@/features/account/components/BuyerProfileHeader";
import { QuickStats } from "@/features/account/components/QuickStats";
import { calculateProfileCompletion } from "@/features/account/utils/profileCompletion";
import { getAverageRating } from "@/services/communityStore";
import { buyerAccountStyles as styles } from "@/features/account/styles/buyerAccountStyles";
import { appTheme as theme } from "@/theme/appTheme";

import { router, useFocusEffect } from "expo-router";
import React from "react";
import { ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BuyerAccountScreen() {
  const { user, logout, refreshUser } = useAuth();

  const displayName = user?.fullName || user?.username || "Consumidor";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  const { percentage } = calculateProfileCompletion(user);
  const averageRating = user ? getAverageRating(user.username, "buyer") : 0;

  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
    }, [refreshUser])
  );

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.primary}
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
          <BuyerProfileHeader
            displayName={displayName}
            email={user?.email || ""}
            profilePhotoUri={user?.avatarUri || null}
            initials={initials}
            onPressEditProfile={() => router.push("/edit-profile")}
          />

          <QuickStats
            rating={averageRating}
            completeness={percentage}
            onPressRating={() => router.push("/ratings")}
            onPressCompleteness={() => router.push("/profile-completion")}
          />

          <BuyerAccountMenu onLogout={logout} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
