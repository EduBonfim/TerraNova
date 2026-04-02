import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const IOS_TAB_BAR = {
  height: 70,
  paddingTop: 6,
  paddingBottom: 6,
};

const ANDROID_TAB_BAR = {
  height: 60,
  paddingTop: 8,
  paddingBottom: 8,
};

const CURRENT_TAB_BAR = Platform.OS === "ios" ? IOS_TAB_BAR : ANDROID_TAB_BAR;

const IOS_TOP_SCREEN = {
  paddingTop: 0,
};

const ANDROID_TOP_SCREEN = {
  paddingTop: 0,
};

const CURRENT_TOP_SCREEN =
  Platform.OS === "ios" ? IOS_TOP_SCREEN : ANDROID_TOP_SCREEN;

function AppLayoutTabs() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: Platform.OS === "android",
        sceneStyle: {
          paddingTop: CURRENT_TOP_SCREEN.paddingTop,
        },
        tabBarActiveTintColor: "#F9A825",
        tabBarInactiveTintColor: "#dfdfdf",
        tabBarStyle: {
          backgroundColor: "#6B8E23",
          borderTopWidth: 0,
          height: CURRENT_TAB_BAR.height,
          paddingBottom: CURRENT_TAB_BAR.paddingBottom,
          paddingTop: CURRENT_TAB_BAR.paddingTop,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
      }}
    >
      {/*0. TELA DE BOAS-VINDAS */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/*1. ABA INICIAL / PAINEL */}
      <Tabs.Screen
        name="home"
        options={{
          ...(isAdmin
            ? { href: null, tabBarStyle: { display: "none" } }
            : {
                title: "Início",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home" size={size} color={color} />
                ),
              }),
        }}
      />

      {/* 2. Aba do Mapa */}
      <Tabs.Screen
        name="map"
        options={{
          ...(isAdmin
            ? { href: null, tabBarStyle: { display: "none" } }
            : {
                title: "Mapa",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="map" size={size} color={color} />
                ),
              }),
        }}
      />

      {/* 3. Aba de Anunciar */}
      <Tabs.Screen
        name="post"
        options={{
          ...(isAdmin
            ? { href: null, tabBarStyle: { display: "none" } }
            : {
                title: "Anunciar",
                tabBarIcon: ({ color, size }) => (
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 30,
                      backgroundColor: "rgba(249, 168, 37, 0.1)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="add-circle" size={50} color={color} />
                  </View>
                ),
                tabBarItemStyle: {
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 0,
                  marginTop: -5,
                },
                tabBarLabelStyle: {
                  marginTop: 5,
                  fontSize: 12,
                  fontWeight: "bold",
                },
              }),
        }}
      />

      {/* 4. Aba do Marketplace */}
      <Tabs.Screen
        name="profile"
        options={{
          ...(isAdmin
            ? { href: null, tabBarStyle: { display: "none" } }
            : {
                title: "Mercado",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="storefront" size={size} color={color} />
                ),
              }),
        }}
      />

      {/* 5. Aba da Trilha Orgânica */}
      <Tabs.Screen
        name="organic"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* 6. Tela de Mensagens (oculta da barra) */}
      <Tabs.Screen
        name="messages"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* 7. Aba de Perfil */}
      <Tabs.Screen
        name="account"
        options={{
          ...(isAdmin
            ? { href: null, tabBarStyle: { display: "none" } }
            : {
                title: "Central",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person" size={size} color={color} />
                ),
              }),
        }}
      />

      <Tabs.Screen
        name="admin-panel"
        options={{
          ...(isAdmin
            ? {
                title: "Painel",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="grid" size={size} color={color} />
                ),
              }
            : { href: null, tabBarStyle: { display: "none" } }),
        }}
      />

      <Tabs.Screen
        name="admin-metrics"
        options={{
          ...(isAdmin
            ? {
                title: "Métricas",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="stats-chart" size={size} color={color} />
                ),
              }
            : { href: null, tabBarStyle: { display: "none" } }),
        }}
      />

      <Tabs.Screen
        name="admin-sales"
        options={{
          ...(isAdmin
            ? {
                title: "Vendas",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="cash" size={size} color={color} />
                ),
              }
            : { href: null, tabBarStyle: { display: "none" } }),
        }}
      />

      <Tabs.Screen
        name="admin-reports"
        options={{
          ...(isAdmin
            ? {
                title: "Denúncias",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="flag" size={size} color={color} />
                ),
              }
            : { href: null, tabBarStyle: { display: "none" } }),
        }}
      />

      {/* --- TELAS OCULTAS DO MENU --- */}
      <Tabs.Screen
        name="scan"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="login"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="register"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="transport"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="user-profile"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="certificates"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="soil-reports"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="privacy-lgpd"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

export default function AppLayout() {
  return (
    <AuthProvider>
      <AppLayoutContent />
    </AuthProvider>
  );
}

function AppLayoutContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#6B8E23" />
      </View>
    );
  }

  return <AppLayoutTabs />;
}
