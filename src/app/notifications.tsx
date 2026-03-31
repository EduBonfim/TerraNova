import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppHeader } from "../components/AppHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import {
  getNotifications,
  markNotificationAsRead,
  type AppNotification,
} from "../services/notificationsStore";

const theme = {
  colors: {
    primary: "#6B8E23",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    gray_900: "#111827",
  },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] =
    useState<AppNotification[]>(getNotifications());

  const openNotificationTarget = (item: AppNotification) => {
    setNotifications(markNotificationAsRead(item.id));
    if (item.route === "/profile" && item.targetItemId) {
      router.push({
        pathname: "/profile",
        params: { highlight: item.targetItemId },
      });
      return;
    }

    router.push(item.route);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Notificacoes"
        subtitle="Historico completo de novidades"
        onBackPress={() => router.replace("/home")}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {notifications.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => openNotificationTarget(item)}
          >
            <SurfaceCard style={styles.notificationCard}>
              <View style={styles.cardHeader}>
                <View style={styles.rowStart}>
                  <View
                    style={[
                      styles.dot,
                      item.isNew ? styles.dotNew : styles.dotRead,
                    ]}
                  />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                <Text style={styles.cardTime}>{item.time}</Text>
              </View>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </SurfaceCard>
          </TouchableOpacity>
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 14 },
  notificationCard: { marginBottom: 10, padding: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowStart: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  dotNew: { backgroundColor: "#EF4444" },
  dotRead: { backgroundColor: "#D1D5DB" },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    flex: 1,
  },
  cardTime: { fontSize: 11, color: theme.colors.gray_500 },
  cardDescription: { fontSize: 13, color: theme.colors.gray_800, marginTop: 6 },
  bottomSpacer: { height: 20 },
});
