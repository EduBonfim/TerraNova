import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { initAuthStore } from "@/services/authStore";
import { initCommunityStore } from "@/services/communityStore";
import { initListingService } from "@/services/listingService";
import {
  checkAndCleanupExpiredAds,
  initMarketplaceStore,
} from "@/services/marketplaceStore";
import { initOrdersStore } from "@/services/ordersStore";
import { initReportsStore } from "@/services/reportsStore";
import { initSoilReportsStore } from "@/services/soilReportsStore";
import { appTheme as theme } from "@/theme/appTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Platform, StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const STORAGE_MIGRATION_FLAG_KEY = "@terra_nova/storage_migration_v2_done";

async function clearLegacyTerraNovaStorage() {
  const migrationFlag = await AsyncStorage.getItem(STORAGE_MIGRATION_FLAG_KEY);
  if (migrationFlag === "1") {
    return;
  }

  const allKeys = await AsyncStorage.getAllKeys();
  const terraNovaKeys = allKeys.filter((key) => key.startsWith("@terra_nova"));

  if (terraNovaKeys.length > 0) {
    await AsyncStorage.multiRemove(terraNovaKeys);
  }

  await AsyncStorage.setItem(STORAGE_MIGRATION_FLAG_KEY, "1");
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.primary}
        />
        <AppLayoutContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppLayoutContent() {
  const { isLoading } = useAuth();

  useEffect(() => {
    const init = async () => {
      try {
        await clearLegacyTerraNovaStorage();
        await initAuthStore();
        await initCommunityStore();
        await initOrdersStore();
        await initSoilReportsStore();
        await initReportsStore();
        await initMarketplaceStore();
        await initListingService();
        await checkAndCleanupExpiredAds();
      } catch (error) {
        console.error("Erro na inicialização:", error);
      }
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.white,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "default" : "slide_from_right",
        gestureEnabled: true,
        gestureDirection: "horizontal",
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {/* 1. TELA DE BOAS-VINDAS */}
      <Stack.Screen name="index" />

      {/* 2. AUTENTICAÇÃO */}
      <Stack.Screen name="login" options={{ animation: "fade" }} />
      <Stack.Screen
        name="register"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="register-type"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="register-buyer"
        options={{ animation: "slide_from_right" }}
      />

      <Stack.Screen
        name="(producer)"
        options={{ animation: "fade", gestureEnabled: false }}
      />

      {/* 5. O GRUPO DE COMPRADORES */}
      <Stack.Screen
        name="(buyer)"
        options={{ animation: "fade", gestureEnabled: false }}
      />
      <Stack.Screen
        name="buyer-certificates"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="(admin)"
        options={{ animation: "fade", gestureEnabled: false }}
      />

      {/* 4. TELAS DE NAVEGAÇÃO DE PILHA (STACK) */}
      <Stack.Screen
        name="messages"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="user-profile"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen name="scan" options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="stock" options={{ animation: "slide_from_right" }} />

      {/* PERFIL E EDIÇÃO */}
      <Stack.Screen
        name="edit-profile"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="edit-address"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="edit-product"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="profile-completion"
        options={{ animation: "slide_from_right" }}
      />

      {/* PEDIDOS E FINANCEIRO */}
      <Stack.Screen
        name="my-orders"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="sales-metrics"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="ratings"
        options={{ animation: "slide_from_right" }}
      />

      {/* ADMIN */}
      <Stack.Screen
        name="account-health"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="admin-metrics"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="admin-reports"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="admin-sales"
        options={{ animation: "slide_from_right" }}
      />

      {/* CONFIGURAÇÕES E PRIVACIDADE */}
      <Stack.Screen
        name="privacy-settings"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="notifications-history"
        options={{ animation: "slide_from_right" }}
      />

      {/* OUTRAS TELAS */}
      <Stack.Screen name="certificates" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="mundo-organico" />
      <Stack.Screen name="seja-organico" />
      <Stack.Screen name="soil-reports" />
      <Stack.Screen name="transport" />
      <Stack.Screen name="privacy-lgpd" />
      <Stack.Screen
        name="warning-details"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="user-reports" options={{ presentation: "card" }} />
      <Stack.Screen name="report-details" options={{ presentation: "card" }} />
    </Stack>
  );
}
