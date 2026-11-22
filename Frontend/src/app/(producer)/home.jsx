import { useAuth } from "@/contexts/AuthContext";
import {
  getProfileSummary,
  initCommunityStore,
  refreshCommunityStore,
} from "@/services/communityStore";
import {
  getProducerNotifications,
  markAllProducerNotificationsAsRead,
  markProducerNotificationAsRead,
  syncProducerNotifications,
} from "@/services/producerNotificationsStore";
import { appTheme as theme } from "@/theme/appTheme";
import { getProducerKPIsAsync } from "@/utils/producerAnalytics";
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  getUnacknowledgedWarnings,
  acknowledgeWarning,
} from "@/services/reportsStore";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  BackHandler,
  RefreshControl,
  ScrollView,
  StatusBar,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes
import { AgroNews } from "@/features/home/components/AgroNews";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { KpiCarousel } from "@/features/home/components/KpiCarousel";
import { MarketOpportunities } from "@/features/home/components/MarketOpportunities";
import { NotificationsModal } from "@/features/home/components/NotificationsModal";
import { QuickActions } from "@/features/home/components/QuickActions";
import { homeStyles as styles } from "@/features/home/styles/home.styles";
import { NewFollowersModal } from "@/features/home/components/NewFollowersModal";

const MAX_NOTIFICATION_PREVIEW = 5;

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { user, logout } = useAuth();
  const profileName = user?.username || "Produtor";

  const [profileSummary, setProfileSummary] = useState(() =>
    getProfileSummary(profileName)
  );
  const [kpis, setKpis] = useState({
    totalAds: 0,
    averageRating: 0,
    monthlySales: 0,
    followers: 0,
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(
    getProducerNotifications()
  );
  const [isNewFollowersModalOpen, setIsNewFollowersModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados de Moderação e Avisos
  const [activeWarnings, setActiveWarnings] = useState([]);
  const [currentWarning, setCurrentWarning] = useState(null);

  const handleAcknowledgeWarning = async () => {
    if (!currentWarning) return;

    await acknowledgeWarning(currentWarning.id);
    const isBan =
      currentWarning.action?.type === "bloqueio" ||
      currentWarning.action?.type === "bloqueio_temporario";

    if (isBan) {
      setCurrentWarning(null);
      setActiveWarnings([]);
      await logout();
      router.replace("/login");
    } else {
      const remaining = activeWarnings.filter(
        (w) => w.id !== currentWarning.id
      );
      setActiveWarnings(remaining);
      if (remaining.length > 0) {
        setCurrentWarning(remaining[0]);
      } else {
        setCurrentWarning(null);
      }
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      if (isFocused) {
        Alert.alert(
          "Sair do App",
          "Deseja realmente fechar o Terra Nova? Sua sessão permanecerá ativa.",
          [
            { text: "Continuar Navegando", style: "cancel" },
            {
              text: "Sair Agora",
              onPress: () => BackHandler.exitApp(),
            },
          ]
        );
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandler.remove();
  }, [isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const syncProfile = async () => {
        try {
          await initCommunityStore();
          await refreshCommunityStore();
          await new Promise((resolve) => setTimeout(resolve, 300));

          if (!isMounted) return;

          // Buscar avisos ou suspensões pendentes para este usuário
          if (user?.username) {
            const unacknowledged = await getUnacknowledgedWarnings(
              user.username
            );
            setActiveWarnings(unacknowledged);
            if (unacknowledged.length > 0) {
              setCurrentWarning(unacknowledged[0]);
            } else {
              setCurrentWarning(null);
            }
          }

          const updated = getProfileSummary(profileName);
          setProfileSummary({ ...updated });

          // Usar versão async para KPIs reais
          const kpisData = await getProducerKPIsAsync(profileName);
          setKpis(kpisData);

          if (user?.id) {
            await syncProducerNotifications(user.id);
          }
          setNotifications(getProducerNotifications());
        } catch (_error) {}
      };

      syncProfile();

      return () => {
        isMounted = false;
      };
    }, [profileName, user?.username, user?.id])
  );

  const latestNotifications = notifications.slice(0, MAX_NOTIFICATION_PREVIEW);
  const hasMoreNotifications = notifications.length > MAX_NOTIFICATION_PREVIEW;
  const unreadCount = notifications.filter((item) => item.isNew).length;

  const openNotifications = () => {
    setIsNotificationsOpen(true);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
    // Marcar todas como lidas ao fechar o modal, garantindo que não sumam enquanto o modal está aberto
    setNotifications(markAllProducerNotificationsAsRead());
  };

  const normalizeNotificationRoute = (route) => {
    if (!route) return "/index";
    let finalRoute = route;

    // Corrigir rotas de pedidos e vendas para ir para o painel unificado
    if (finalRoute.startsWith("/orders") || finalRoute.startsWith("/sales")) {
      return "/my-orders";
    }

    // Corrigir /admin/home para /(admin)/home
    if (finalRoute === "/admin/home") {
      return "/(admin)/home";
    }

    // Corrigir rotas do produtor que estão na raiz mas foram salvas com prefixo /(producer)
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
      return "/(producer)/home";
    }

    return finalRoute;
  };

  // Marcar como lida para mover para o histórico
  const openNotificationTarget = (item) => {
    setNotifications(markProducerNotificationAsRead(item.id));
    closeNotifications();

    if (item.category === "comunidade") {
      setIsNewFollowersModalOpen(true);
      return;
    }

    if (item.route.includes("/profile") && item.targetItemId) {
      router.push({
        pathname: "/(producer)/profile",
        params: { highlight: item.targetItemId },
      });
      return;
    }

    const finalRoute = normalizeNotificationRoute(item.route);

    let typeParam = undefined;
    if (
      item.route &&
      (item.route.startsWith("/orders") || item.route.startsWith("/sales"))
    ) {
      typeParam = item.route.startsWith("/orders") ? "purchases" : "sales";
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
  };

  const openAllNotifications = () => {
    closeNotifications();
    router.push("/notifications-history");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await initCommunityStore();
      setProfileSummary({ ...getProfileSummary(profileName) });

      // Usar versão async para KPIs reais
      const kpisData = await getProducerKPIsAsync(profileName);
      setKpis(kpisData);

      if (user?.id) {
        await syncProducerNotifications(user.id);
      }
      setNotifications(getProducerNotifications());
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
        translucent={false}
      />
      <HomeHeader
        profileSummary={profileSummary}
        unreadCount={unreadCount}
        openNotifications={openNotifications}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <KpiCarousel kpis={kpis} />

        <MarketOpportunities />

        <QuickActions />

        <AgroNews />
      </ScrollView>

      <NotificationsModal
        isNotificationsOpen={isNotificationsOpen}
        closeNotifications={closeNotifications}
        latestNotifications={latestNotifications}
        hasMoreNotifications={hasMoreNotifications}
        openNotificationTarget={openNotificationTarget}
        openAllNotifications={openAllNotifications}
      />

      <NewFollowersModal
        isOpen={isNewFollowersModalOpen}
        onClose={() => setIsNewFollowersModalOpen(false)}
      />

      {/* --- MODAL DE AVISO DE MODERAÇÃO E BANIMENTO --- */}
      <Modal
        visible={currentWarning !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          // Bloqueia o fechamento pelo botão de voltar físico/virtual do Android
          return;
        }}
      >
        <View style={warningStyles.warningModalBackdrop}>
          <View style={warningStyles.warningModalContent}>
            <View
              style={[
                warningStyles.warningIconContainer,
                currentWarning?.action?.type === "bloqueio" ||
                currentWarning?.action?.type === "bloqueio_temporario"
                  ? warningStyles.warningIconContainerBan
                  : warningStyles.warningIconContainerWarning,
              ]}
            >
              <Ionicons
                name={
                  currentWarning?.action?.type === "bloqueio" ||
                  currentWarning?.action?.type === "bloqueio_temporario"
                    ? "ban"
                    : "alert-circle"
                }
                size={36}
                color={theme.colors.white}
              />
            </View>

            <Text style={warningStyles.warningModalTitle}>
              {currentWarning?.action?.type === "bloqueio" ||
              currentWarning?.action?.type === "bloqueio_temporario"
                ? "Sua conta foi suspensa!"
                : "Você foi denunciado!"}
            </Text>

            <Text style={warningStyles.warningSubtitle}>
              {currentWarning?.action?.type === "bloqueio" ||
              currentWarning?.action?.type === "bloqueio_temporario"
                ? "A moderação aplicou uma suspensão na sua conta por violação dos termos de uso."
                : "A moderação do Terra Nova enviou um aviso sobre o seu comportamento no app."}
            </Text>

            <View style={warningStyles.warningDetailsBox}>
              <View style={warningStyles.warningDetailRow}>
                <Text style={warningStyles.warningDetailLabel}>Motivo:</Text>
                <Text style={warningStyles.warningDetailValue}>
                  {currentWarning?.reason}
                </Text>
              </View>

              {currentWarning?.description ? (
                <View style={warningStyles.warningDetailRow}>
                  <Text style={warningStyles.warningDetailLabel}>
                    Descrição:
                  </Text>
                  <Text style={warningStyles.warningDetailValueText}>
                    {currentWarning.description}
                  </Text>
                </View>
              ) : null}

              <View style={warningStyles.warningDetailRow}>
                <Text style={warningStyles.warningDetailLabel}>Decisão:</Text>
                <Text
                  style={[
                    warningStyles.warningDetailValueBadge,
                    currentWarning?.action?.type === "bloqueio" ||
                    currentWarning?.action?.type === "bloqueio_temporario"
                      ? warningStyles.warningBadgeBan
                      : warningStyles.warningBadgeWarning,
                  ]}
                >
                  {currentWarning?.action?.type === "bloqueio"
                    ? "Banimento Permanente"
                    : currentWarning?.action?.type === "bloqueio_temporario"
                    ? `Suspensão por ${currentWarning.action.blockDays} dias`
                    : "Advertência / Notificação"}
                </Text>
              </View>

              {currentWarning?.action?.details ? (
                <View
                  style={[
                    warningStyles.warningDetailRow,
                    {
                      borderTopWidth: 1,
                      borderTopColor: theme.colors.gray_200,
                      paddingTop: 10,
                      marginTop: 5,
                    },
                  ]}
                >
                  <Text style={warningStyles.warningDetailLabel}>
                    Detalhes:
                  </Text>
                  <Text style={warningStyles.warningDetailValueText}>
                    {currentWarning.action.details}
                  </Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                warningStyles.warningConfirmButton,
                currentWarning?.action?.type === "bloqueio" ||
                currentWarning?.action?.type === "bloqueio_temporario"
                  ? warningStyles.warningConfirmButtonBan
                  : warningStyles.warningConfirmButtonWarning,
              ]}
              onPress={handleAcknowledgeWarning}
            >
              <Text style={warningStyles.warningConfirmButtonText}>
                {currentWarning?.action?.type === "bloqueio" ||
                currentWarning?.action?.type === "bloqueio_temporario"
                  ? "Entendi e Sair"
                  : "Entendi o Aviso"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const warningStyles = StyleSheet.create({
  warningModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  warningModalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    width: "100%",
    maxWidth: 340,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  warningIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  warningIconContainerWarning: {
    backgroundColor: theme.colors.orange_500,
  },
  warningIconContainerBan: {
    backgroundColor: theme.colors.red_500,
  },
  warningModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    textAlign: "center",
    marginBottom: 8,
  },
  warningSubtitle: {
    fontSize: 13,
    color: theme.colors.gray_500,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  warningDetailsBox: {
    width: "100%",
    backgroundColor: theme.colors.gray_100,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  warningDetailRow: {
    width: "100%",
    flexDirection: "column",
    gap: 4,
  },
  warningDetailLabel: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: theme.colors.gray_400,
    letterSpacing: 0.5,
  },
  warningDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  warningDetailValueText: {
    fontSize: 13,
    color: theme.colors.gray_700,
    lineHeight: 18,
  },
  warningDetailValueBadge: {
    fontSize: 12,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  warningBadgeWarning: {
    backgroundColor: "#FEF3C7",
    color: "#D97706",
  },
  warningBadgeBan: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
  },
  warningConfirmButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  warningConfirmButtonWarning: {
    backgroundColor: theme.colors.primary,
  },
  warningConfirmButtonBan: {
    backgroundColor: theme.colors.red_500,
  },
  warningConfirmButtonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
});
