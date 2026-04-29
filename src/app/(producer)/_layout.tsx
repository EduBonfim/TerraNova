import { useAuth } from "@/contexts/AuthContext";
import { useMarketplaceLogic } from "@/features/marketplace/hooks/useMarketplaceLogic";
import { hasOutOfStockItems } from "@/services/marketplaceStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IOS_TAB_BAR_HEIGHT = 40;
const ANDROID_TAB_BAR_HEIGHT = 45;

export default function TabLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const insets = useSafeAreaInsets();
  const { filteredMarketplaceItems } = useMarketplaceLogic();

  const showStockBadge = !isAdmin && hasOutOfStockItems(filteredMarketplaceItems, user?.username || user?.fullName || "");

  const tabHeight = Platform.OS === "ios" ? IOS_TAB_BAR_HEIGHT : ANDROID_TAB_BAR_HEIGHT;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.colors.orange_500,
        tabBarInactiveTintColor: "rgba(223, 223, 223, 0.8)",
        tabBarStyle: {
          backgroundColor: theme.colors.primary,
          borderTopWidth: 0,
          height: tabHeight + (insets.bottom > 0 ? insets.bottom : (Platform.OS === "android" ? 20 : 0)),
          paddingBottom: insets.bottom > 0 ? insets.bottom : (Platform.OS === "android" ? 20 : 8),
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "bold",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          href: isAdmin ? null : "/home",
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
          href: isAdmin ? null : "/map",
        }}
      />

      <Tabs.Screen
        name="post"
        options={{
          title: "Anunciar",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "rgba(249, 168, 37, 0.15)",
                justifyContent: "center",
                alignItems: "center",
                marginTop: -4,  // Negativo sobe, positivo desce
                marginLeft: 0,   // Negativo esquerda, positivo direita
              }}
            >
              <Ionicons name="add-circle" size={60} color={color} />
              {showStockBadge && (
                <View 
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: theme.colors.red_500,
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                  }}
                />
              )}
            </View>
          ),
          tabBarLabel: ({ color }) => (
            <Text
              style={{
                color,
                fontSize: 11,    // Tamanho da fonte
                marginTop: 8,    // Negativo sobe o texto, positivo desce
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Anunciar
            </Text>
          ),
          href: isAdmin ? null : "/post",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Mercado",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
          href: isAdmin ? null : "/profile",
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Central",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="person" size={size} color={color} />
              {showStockBadge && (
                <View 
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.colors.red_500,
                    borderWidth: 1.5,
                    borderColor: theme.colors.primary,
                  }}
                />
              )}
            </View>
          ),
        }}
      />

      {/* Rota oculta de Checkout (Não renderiza na Tab Bar) */}
      <Tabs.Screen
        name="checkout"
        options={{
          href: null,
          title: "Carrinho",
        }}
      />
    </Tabs>
  );
}
