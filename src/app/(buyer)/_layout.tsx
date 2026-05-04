import { useCart } from "@/services/cartStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IOS_TAB_BAR_HEIGHT = 40;
const ANDROID_TAB_BAR_HEIGHT = 45;

export default function BuyerLayout() {
  const insets = useSafeAreaInsets();
  const tabHeight = Platform.OS === "ios" ? IOS_TAB_BAR_HEIGHT : ANDROID_TAB_BAR_HEIGHT;
  const { totalItems } = useCart();

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.colors.orange_500,
        tabBarInactiveTintColor: theme.colors.white,
        tabBarStyle: {
          backgroundColor: theme.colors.primary,
          borderTopWidth: 0,
          height: tabHeight + (insets.bottom > 0 ? insets.bottom : Platform.OS === "android" ? 20 : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom : Platform.OS === "android" ? 20 : 8,
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
      {/* Início */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* Mercado */}
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Mercado",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "storefront" : "storefront-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* Carrinho (Central Destacado) */}
      <Tabs.Screen
        name="checkout"
        options={{
          title: "Carrinho",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "rgba(249, 115, 22, 0.15)",
                justifyContent: "center",
                alignItems: "center",
                marginTop: -4,
                marginLeft: -5,
              }}
            >
              <Ionicons name="cart" size={50} color={color} />
              {totalItems > 0 && (
                <View 
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: theme.colors.red_500,
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>
                    {totalItems > 99 ? "99+" : totalItems}
                  </Text>
                </View>
              )}
            </View>
          ),
          tabBarLabel: ({ color }) => (
            <Text
              style={{
                color,
                fontSize: 11,
                marginTop: 8,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Carrinho
            </Text>
          ),
        }}
      />

      {/* Chat */}
      <Tabs.Screen
        name="messages"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* Central */}
      <Tabs.Screen
        name="account"
        options={{
          title: "Central",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* Escondidos */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="favorite-farms"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
