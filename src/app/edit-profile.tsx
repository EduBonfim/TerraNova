import React from "react";
import { StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { appTheme as theme } from "@/theme/appTheme";
import { BuyerProfileForm } from "@/features/account/ui/BuyerProfileForm";
import { ProducerProfileForm } from "@/features/account/ui/ProducerProfileForm";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isBuyer = user?.role === "buyer";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Editar Perfil"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />
      
      {isBuyer ? <BuyerProfileForm /> : <ProducerProfileForm />}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
});
