import React from "react";
import { Stack } from "expo-router";
import { View, ActivityIndicator, StatusBar, Platform, UIManager } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { appTheme as theme } from "@/theme/appTheme";
import { initAuthStore } from "@/services/authStore";
import { initCommunityStore } from "@/services/communityStore";
import { initOrdersStore } from "@/services/ordersStore";
import { initSoilReportsStore } from "@/services/soilReportsStore";
import { initMarketplaceStore, checkAndCleanupExpiredAds } from "@/services/marketplaceStore";
import { initListingService } from "@/services/listingService";
import { useEffect } from "react";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
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
        await initAuthStore();
        await initCommunityStore();
        await initOrdersStore();
        await initSoilReportsStore();
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.white }}>
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
      <Stack.Screen 
        name="login" 
        options={{ animation: "fade" }}
      />
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
        name="(tabs)" 
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
      <Stack.Screen 
        name="scan" 
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen 
        name="stock" 
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
    </Stack>
  );
}
