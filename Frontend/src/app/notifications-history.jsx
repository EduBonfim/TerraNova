import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { appTheme as theme } from "@/theme/appTheme";

import { useAuth } from "@/contexts/AuthContext";
import { getNotificationsHistory as getProducerHistory } from "@/services/producerNotificationsStore";
import { getNotificationsHistory as getBuyerHistory } from "@/services/buyerNotificationsStore";

export default function NotificationsHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user?.role === "producer") {
      setHistory(getProducerHistory());
    } else {
      setHistory(getBuyerHistory());
    }
  }, [user]);

  const getCategoryIcon = (category) => {
    switch (category) {
      // Categorias do Produtor
      case "vendas":
        return { name: "cart", color: "#10B981" };
      case "chat":
        return { name: "chatbubble-ellipses", color: "#3B82F6" };
      case "comunidade":
        return { name: "people", color: "#8B5CF6" };
      case "alerta":
        return { name: "warning", color: "#EF4444" };
      case "laudo":
        return { name: "document-text", color: "#059669" };

      // Categorias do Comprador
      case "pedidos":
        return { name: "receipt", color: "#F59E0B" };
      case "ofertas":
        return { name: "pricetags", color: "#EC4899" };
      case "compras":
        return { name: "bag-check", color: "#8B5CF6" };
      case "produtos":
        return { name: "leaf", color: "#10B981" };

      default:
        return { name: "notifications", color: theme.colors.gray_400 };
    }
  };

  const normalizeNotificationRoute = (route) => {
    if (!route) return "/index";
    let finalRoute = route;

    if (finalRoute.startsWith("/orders") || finalRoute.startsWith("/sales")) {
      return "/my-orders";
    }

    if (finalRoute === "/admin/home") {
      return "/(admin)/home";
    }

    if (finalRoute.startsWith("/(producer)/")) {
      const subPath = finalRoute.replace("/(producer)/", "");
      const rootFiles = [
        "sales-metrics",
        "ratings",
        "soil-reports",
        "edit-profile",
        "edit-product",
        "edit-address",
        "account-health",
        "user-profile",
      ];
      if (rootFiles.includes(subPath)) {
        return `/${subPath}`;
      }
    }

    // Correção de segurança genérica existente
    if (finalRoute === "/home" || finalRoute === "/profile") {
      return user?.role === "producer"
        ? `/(producer)${finalRoute}`
        : finalRoute === "/profile"
        ? "/user-profile"
        : `/(buyer)${finalRoute}`;
    }

    return finalRoute;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.infoText}>
              Estas são as notificações que você já visualizou nos últimos 7
              dias.
            </Text>
          </View>

          {history.length > 0 ? (
            <View style={styles.historyList}>
              {history.map((item) => {
                const icon = getCategoryIcon(item.category);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.historyItem}
                    onPress={() => {
                      if (!item.route) return;

                      // Se for comunidade, abrimos o modal na home (ou navegamos pra home)
                      if (item.category === "comunidade") {
                        router.push(
                          user?.role === "producer"
                            ? "/(producer)/home"
                            : "/(buyer)/home"
                        );
                        return;
                      }

                      const finalRoute = normalizeNotificationRoute(item.route);

                      let typeParam = undefined;
                      if (
                        item.route &&
                        (item.route.startsWith("/orders") ||
                          item.route.startsWith("/sales"))
                      ) {
                        typeParam = item.route.startsWith("/orders")
                          ? "purchases"
                          : "sales";
                      }

                      // Lógica de perfil/detalhes do item
                      if (
                        item.route.includes("/profile") &&
                        item.targetItemId
                      ) {
                        const profilePath =
                          user?.role === "producer"
                            ? "/(producer)/profile"
                            : "/user-profile";
                        router.push({
                          pathname: profilePath,
                          params: { highlight: item.targetItemId },
                        });
                        return;
                      }

                      if (item.targetItemId || typeParam) {
                        router.push({
                          pathname: finalRoute,
                          params: {
                            highlight: item.targetItemId,
                            id: item.targetItemId,
                            ...(typeParam ? { type: typeParam } : {}),
                          },
                        });
                        return;
                      }

                      router.push(finalRoute);
                    }}
                  >
                    <View style={styles.iconColumn}>
                      <View
                        style={[
                          styles.iconCircle,
                          { backgroundColor: icon.color + "15" },
                        ]}
                      >
                        <Ionicons
                          name={icon.name}
                          size={18}
                          color={icon.color}
                        />
                      </View>
                    </View>
                    <View style={styles.itemBody}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.itemDesc}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View
                style={{
                  backgroundColor: theme.colors.gray_100,
                  padding: 30,
                  borderRadius: 50,
                }}
              >
                <Ionicons
                  name="archive-outline"
                  size={60}
                  color={theme.colors.gray_300}
                />
              </View>
              <Text style={styles.emptyTitle}>Nenhum histórico</Text>
              <Text style={styles.emptyDesc}>
                Suas notificações resolvidas e visualizadas aparecerão aqui para
                sua referência.
              </Text>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    margin: 16,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray_100,
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.gray_600,
    flex: 1,
    lineHeight: 18,
  },
  historyList: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray_100,
    overflow: "hidden",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  iconColumn: {
    width: 44,
    alignItems: "center",
    paddingTop: 2,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  itemBody: {
    flex: 1,
    marginRight: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    flex: 1,
    marginRight: 8,
  },
  itemTime: {
    fontSize: 11,
    color: theme.colors.gray_400,
    fontWeight: "500",
  },
  itemDesc: {
    fontSize: 13,
    color: theme.colors.gray_500,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginTop: 20,
  },
  emptyDesc: {
    fontSize: 14,
    color: theme.colors.gray_500,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 50,
    lineHeight: 20,
  },
});
