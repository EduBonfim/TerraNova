import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import {
    getNotificationsByRole,
    markNotificationAsRead,
    type AppNotification,
} from "@/services/notificationsStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      // Load notifications based on the current user's role and username
      const role = user?.role === "buyer" ? "buyer" : "producer";
      setNotifications(getNotificationsByRole(role, user?.username));
    }, [user?.role, user?.username])
  );

  const openNotificationTarget = (item: AppNotification) => {
    setNotifications(markNotificationAsRead(item.id));
    
    if (item.route === "/(buyer)/marketplace" && item.targetItemId) {
      router.push({
        pathname: "/(buyer)/marketplace",
        params: { highlight: item.targetItemId },
      });
      return;
    }
    
    if (item.route === "/warning-details" && item.targetItemId) {
      router.push({
        pathname: "/warning-details",
        params: { id: item.targetItemId },
      });
      return;
    }

    router.push(item.route);
  };

  const getNotificationIcon = (category?: string) => {
    switch (category) {
      case "pedidos":
      case "vendas":
        return "cart-outline";
      case "ofertas":
        return "gift-outline";
      case "compras":
        return "card-outline";
      case "produtos":
        return "storefront-outline";
      case "laudo":
        return "document-outline";
      case "certificado":
        return "checkmark-circle-outline";
      case "chat":
        return "chatbubble-outline";
      case "alerta":
        return "warning-outline";
      case "sistema":
        return "information-circle-outline";
      default:
        return "notifications-outline";
    }
  };

  const getNotificationColor = (category?: string) => {
    switch (category) {
      case "pedidos":
      case "vendas":
        return theme.colors.orange_500;
      case "ofertas":
        return theme.colors.primary;
      case "compras":
        return "#4CAF50";
      case "produtos":
        return theme.colors.orange_500;
      case "laudo":
        return "#4CAF50";
      case "certificado":
        return theme.colors.primary;
      case "chat":
        return "#2196F3";
      case "alerta":
        return theme.colors.red_500;
      case "sistema":
        return theme.colors.gray_600;
      default:
        return theme.colors.gray_500;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Notificações"
        subtitle="Suas atualizações recentes"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_300}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => openNotificationTarget(item)} activeOpacity={0.7}>
              <SurfaceCard style={[styles.notificationCard, item.isNew && styles.notificationCardNew]}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconSection}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: `${getNotificationColor(item.category)}15` },
                      ]}
                    >
                      <Ionicons
                        name={getNotificationIcon(item.category) as any}
                        size={18}
                        color={getNotificationColor(item.category)}
                      />
                    </View>
                    {item.isNew && <View style={styles.newDot} />}
                  </View>
                  <View style={styles.contentSection}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>
                  </View>
                  <Text style={styles.cardTime}>{item.time}</Text>
                </View>
              </SurfaceCard>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.colors.gray_300} />
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptySubtitle}>Você receberá atualizações importantes aqui</Text>
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16 },
  notificationCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.gray_300,
  },
  notificationCardNew: {
    borderLeftColor: theme.colors.orange_500,
    backgroundColor: "#FFFBF5",
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
  },
  iconSection: {
    position: "relative",
    justifyContent: "flex-start",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  newDot: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.orange_500,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  contentSection: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_900,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 11,
    color: theme.colors.gray_500,
    lineHeight: 15,
  },
  cardTime: {
    fontSize: 10,
    color: theme.colors.gray_400,
    textAlign: "right",
    minWidth: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.gray_800,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.gray_500,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 16,
  },
  bottomSpacer: { height: 20 },
});
