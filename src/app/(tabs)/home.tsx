import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  Pressable,
  RefreshControl,
  BackHandler,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { SurfaceCard } from "@/components/SurfaceCard";
import { getProfileSummary, initCommunityStore, refreshCommunityStore } from "@/services/communityStore";
import {
  getNotificationsByRole,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "../../services/notificationsStore";
import { getProducerKPIs, getRecentSales, type ProducerKPI, type RecentSale } from "@/utils/producerAnalytics";
import { appTheme as theme } from "../../theme/appTheme";

// 🎨 PALETA OFICIAL TERRA NOVA já importada do theme

const IOS_VISUAL = {
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 16,
};

const ANDROID_VISUAL = {
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 20,
};

const CURRENT_PLATFORM_UI = Platform.OS === "ios" ? IOS_VISUAL : ANDROID_VISUAL;

const MAX_NOTIFICATION_PREVIEW = 5;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const profileName = user?.username || "Produtor";
  const [profileSummary, setProfileSummary] = useState(() => getProfileSummary(profileName));
  const [kpis, setKpis] = useState<ProducerKPI>(() => getProducerKPIs(profileName));
  const [recentSales, setRecentSales] = useState<RecentSale[]>(() => getRecentSales(profileName));
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(getNotificationsByRole("producer"));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentKpiIndex, setCurrentKpiIndex] = useState(0);
  const salesCarouselRef = React.useRef<ScrollView>(null);
  const kpiCarouselRef = React.useRef<ScrollView>(null);

  // KPI items para o carrossel
  const kpiItems = [
    {
      id: "ads",
      icon: "pricetag",
      iconColor: theme.colors.primary,
      value: kpis.totalAds,
      label: "Anúncios",
    },
    {
      id: "rating",
      icon: "star",
      iconColor: "#FBBF24",
      value: kpis.averageRating.toFixed(1),
      label: "Avaliação",
    },
    {
      id: "sales",
      icon: "cash",
      iconColor: theme.colors.accent,
      value: `R$ ${(kpis.monthlySales / 1000).toFixed(1)}k`,
      label: "Vendas/Mês",
    },
    {
      id: "followers",
      icon: "people",
      iconColor: theme.colors.orange_500,
      value: kpis.followers,
      label: "Seguidores",
    },
  ];

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
              onPress: () => BackHandler.exitApp() 
            }
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

  // Sync profile when screen receives focus (useFocusEffect for immediate refresh)
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const syncProfile = async () => {
        try {
          await initCommunityStore();
          await refreshCommunityStore();
          await new Promise(resolve => setTimeout(resolve, 300));
          
          if (!isMounted) return;

          const updated = getProfileSummary(profileName);
          setProfileSummary({ ...updated });
          setKpis(getProducerKPIs(profileName));
          setRecentSales(getRecentSales(profileName));
        } catch (error) {
          // Silent fail
        }
      };

      syncProfile();

      return () => {
        isMounted = false;
      };
    }, [profileName])
  );

  // Auto-rotate KPI carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKpiIndex((prev) => {
        const nextIndex = (prev + 1) % kpiItems.length;
        // Scroll carousel to next position
        kpiCarouselRef.current?.scrollTo({
          x: nextIndex * (SCREEN_WIDTH - 32),
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [kpiItems.length]);

  const latestNotifications = notifications.slice(0, MAX_NOTIFICATION_PREVIEW);
  const hasMoreNotifications = notifications.length > MAX_NOTIFICATION_PREVIEW;
  const unreadCount = notifications.filter((item) => item.isNew).length;

  const openNotifications = () => {
    setNotifications(markAllNotificationsAsRead());
    setIsNotificationsOpen(true);
  };
  const closeNotifications = () => setIsNotificationsOpen(false);

  const openNotificationTarget = (item: AppNotification) => {
    setNotifications(markNotificationAsRead(item.id));
    closeNotifications();
    if (item.route === "/profile" && item.targetItemId) {
      router.push({ pathname: "/user-profile", params: { highlight: item.targetItemId } });
      return;
    }

    router.push(item.route);
  };

  const openAllNotifications = () => {
    closeNotifications();
    router.push("/notifications");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simular delay de requisição
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Recarregar dados
      await initCommunityStore();
      setProfileSummary({ ...getProfileSummary(profileName) });
      setKpis(getProducerKPIs(profileName));
      setRecentSales(getRecentSales(profileName));
      setNotifications(getNotificationsByRole("producer"));
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
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
        {/* --- CABEÇALHO DO USUÁRIO --- */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={
                profileSummary.avatarUri
                  ? { uri: `${profileSummary.avatarUri}?t=${new Date().getTime()}` }
                  : require("../../assets/perfil.png")
              }
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Olá, {profileSummary.displayName}</Text>
              <Text style={styles.location}>
                <Ionicons
                  name="location"
                  size={12}
                  color={theme.colors.primary}
                />{" "}
                {profileSummary.farmName}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationIcon} onPress={openNotifications}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.colors.gray_900}
            />
            {unreadCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* --- DASHBOARD DE KPIs (CARROSSEL) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meu Desempenho</Text>
          
          <ScrollView
            ref={kpiCarouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            snapToInterval={SCREEN_WIDTH - 32}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: 16,
            }}
            onScroll={(event) => {
              const contentOffsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(contentOffsetX / (SCREEN_WIDTH - 32));
              if (index !== currentKpiIndex && index < kpiItems.length) {
                setCurrentKpiIndex(index);
              }
            }}
            style={styles.kpiCarouselScroll}
          >
            {kpiItems.map((item) => (
              <View
                key={item.id}
                style={[styles.kpiCarouselItem, { width: SCREEN_WIDTH - 32 }]}
              >
                <SurfaceCard style={styles.kpiCard} bordered={false}>
                  <View style={styles.kpiCardContent}>
                    <View style={styles.kpiIconCircle}>
                      <Ionicons
                        name={item.icon as any}
                        size={48}
                        color={item.iconColor}
                      />
                    </View>
                    <Text style={styles.kpiCarouselValue}>{item.value}</Text>
                    <Text style={styles.kpiCarouselLabel}>{item.label}</Text>
                  </View>
                </SurfaceCard>
              </View>
            ))}
          </ScrollView>

          {/* KPI Carousel Dots */}
          <View style={styles.kpiDotsContainer}>
            {kpiItems.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.kpiDot,
                  index === currentKpiIndex && styles.kpiDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* --- OPORTUNIDADES DO MERCADO --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Oportunidades</Text>

          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <SurfaceCard style={styles.alertCard} bordered={false}>
            <View style={[styles.alertIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="trending-up" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Demanda em Alta: Orgânicos</Text>
              <Text style={styles.alertDesc}>
                Frutas e hortaliças orgânicas têm procura 40% acima da média.
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
            </SurfaceCard>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <SurfaceCard style={styles.alertCard} bordered={false}>
            <View
              style={[
                styles.alertIcon,
                { backgroundColor: "#FEF3C7" },
              ]}
            >
              <Ionicons
                name="pricetag"
                size={20}
                color={theme.colors.orange_500}
              />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Bom Preço: Coma Localizada</Text>
              <Text style={styles.alertDesc}>
                Produtores locais pagam até 20% mais por volume direto.
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
            </SurfaceCard>
          </TouchableOpacity>
        </View>

        {/* --- AÇÕES RÁPIDAS (2x2 Grid) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          {/* Primeira Linha de Ações */}
          <View style={styles.actionRow}>
            {/* Análise de Solo */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/scan")}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="beaker" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Análise de Solo</Text>
            </TouchableOpacity>

            {/* Ver Minhas Vendas */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/my-orders")}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="bag-check" size={32} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Minhas Vendas</Text>
            </TouchableOpacity>
          </View>

          {/* Segunda Linha de Ações */}
          <View style={styles.actionRow}>
            {/* Gerenciar Estoque */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/stock")}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="layers" size={32} color={theme.colors.orange_500} />
              </View>
              <Text style={styles.actionText}>Gerenciar Estoque</Text>
            </TouchableOpacity>

            {/* Enviar Mensagem */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/messages")}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="chatbubble-ellipses" size={32} color="#8B5CF6" />
              </View>
              <Text style={styles.actionText}>Mensagens</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- ÚLTIMAS VENDAS (Carousel Swipeable) --- */}
        {recentSales.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Últimas Vendas</Text>
            <ScrollView
              ref={salesCarouselRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingHorizontal: 0 }}
              style={styles.salesCarouselScroll}
            >
              {recentSales.map((sale) => (
                <View
                  key={sale.id}
                  style={[styles.saleCard, { width: SCREEN_WIDTH - 48 }]}
                >
                  <View style={styles.saleHeader}>
                    <View style={styles.saleInfo}>
                      <Text style={styles.saleProductName} numberOfLines={1}>
                        {sale.productName}
                      </Text>
                      <Text style={styles.saleBuyerName} numberOfLines={1}>
                        {sale.buyerName}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.saleStatusBadge,
                        sale.status === "completed" && styles.saleStatusCompleted,
                        sale.status === "pending" && styles.saleStatusPending,
                        sale.status === "cancelled" && styles.saleStatusCancelled,
                      ]}
                    >
                      <Text style={styles.saleStatusText}>
                        {sale.status === "completed"
                          ? "✓ Concluída"
                          : sale.status === "pending"
                          ? "⏳ Pendente"
                          : "✕ Cancelada"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.saleBody}>
                    <View style={styles.saleDetail}>
                      <Text style={styles.saleDetailLabel}>Quantidade</Text>
                      <Text style={styles.saleDetailValue}>{sale.quantity} un</Text>
                    </View>
                    <View style={styles.saleDivider} />
                    <View style={styles.saleDetail}>
                      <Text style={styles.saleDetailLabel}>Total</Text>
                      <Text style={styles.saleDetailValue}>
                        R$ {sale.totalPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.saleFooter}>
                    <Text style={styles.saleDateText}>{sale.date}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* --- NOTÍCIAS DO AGRO --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notícias e Destaques</Text>

          <TouchableOpacity>
            <SurfaceCard style={styles.newsCard} bordered={false}>
            <View style={styles.newsImagePlaceholder}>
              <Ionicons
                name="newspaper-outline"
                size={32}
                color={theme.colors.gray_500}
              />
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>
                Compostagem Orgânica: Reduza custos em até 40%
              </Text>
              <Text style={styles.newsSource}>Jornal do Campo • Hoje</Text>
            </View>
            </SurfaceCard>
          </TouchableOpacity>

          <TouchableOpacity>
            <SurfaceCard style={styles.newsCard} bordered={false}>
            <View style={styles.newsImagePlaceholder}>
              <Ionicons name="earth" size={32} color={theme.colors.gray_500} />
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>
                Novos incentivos para a transição agroecológica
              </Text>
              <Text style={styles.newsSource}>AgroNews • Ontem</Text>
            </View>
            </SurfaceCard>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isNotificationsOpen}
        transparent
        animationType="fade"
        onRequestClose={closeNotifications}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeNotifications}>
          <Pressable style={styles.notificationsPanel} onPress={() => {}}>
            <View style={styles.notificationsHeader}>
              <Text style={styles.notificationsTitle}>Novidades</Text>
              <TouchableOpacity onPress={closeNotifications}>
                <Ionicons name="close" size={20} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            {latestNotifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.notificationItem}
                onPress={() => openNotificationTarget(item)}
              >
                <View style={styles.notificationDotWrap}>
                  <View
                    style={[
                      styles.notificationDot,
                      item.isNew ? styles.notificationDotNew : styles.notificationDotRead,
                    ]}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationItemTitle}>{item.title}</Text>
                  <Text style={styles.notificationItemDescription}>{item.description}</Text>
                </View>
                <Text style={styles.notificationItemTime}>{item.time}</Text>
              </TouchableOpacity>
            ))}

            {hasMoreNotifications ? (
              <TouchableOpacity style={styles.viewAllNotificationsButton} onPress={openAllNotifications}>
                <Text style={styles.viewAllNotificationsText}>Ver todas as notificacoes</Text>
              </TouchableOpacity>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ESTILOS ATUALIZADOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { paddingBottom: 12 },

  // Header (Limpo e profissional)
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: CURRENT_PLATFORM_UI.headerHeight,
    paddingHorizontal: 16,
    paddingBottom: CURRENT_PLATFORM_UI.headerPaddingBottom,
    paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    overflow: "hidden",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  greeting: { fontSize: 20, fontWeight: "bold", color: theme.colors.white },
  location: { fontSize: 14, color: theme.colors.white, marginTop: 2 },
  notificationIcon: { padding: 8, position: "relative" },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "red",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: { color: theme.colors.white, fontSize: 10, fontWeight: "bold" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.35)",
    justifyContent: "flex-start",
    paddingTop: CURRENT_PLATFORM_UI.headerHeight + 8,
    paddingHorizontal: 14,
  },
  notificationsPanel: {
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  notificationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  notificationsTitle: { fontSize: 16, fontWeight: "bold", color: theme.colors.gray_900 },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  notificationDotWrap: { width: 14, paddingTop: 6 },
  notificationDot: { width: 8, height: 8, borderRadius: 4 },
  notificationDotNew: { backgroundColor: "#EF4444" },
  notificationDotRead: { backgroundColor: "#D1D5DB" },
  notificationContent: { flex: 1, marginRight: 8 },
  notificationItemTitle: { fontSize: 13, fontWeight: "bold", color: theme.colors.gray_900 },
  notificationItemDescription: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  notificationItemTime: { fontSize: 11, color: theme.colors.gray_500 },
  viewAllNotificationsButton: { paddingVertical: 10, alignItems: "center" },
  viewAllNotificationsText: { fontSize: 13, color: theme.colors.primary, fontWeight: "bold" },

  // Seções
  section: { padding: 18, paddingBottom: 0 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 12,
  },

  // Cards Radar
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertTextContainer: { flex: 1 },
  alertTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_900,
  },
  alertDesc: { fontSize: 13, color: theme.colors.gray_500, marginTop: 2 },

  // Ações Rápidas
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    color: theme.colors.gray_900,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 18,
  },

  // Notícias
  newsCard: {
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    padding: 0,
  },
  newsImagePlaceholder: {
    width: 100,
    backgroundColor: theme.colors.gray_200,
    justifyContent: "center",
    alignItems: "center",
  },
  newsContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginBottom: 8,
    lineHeight: 20,
  },
  newsSource: { fontSize: 12, color: theme.colors.gray_500 },

  // Dashboard de KPIs (Carrossel)
  kpiCarouselScroll: {
    marginHorizontal: -16,
  },
  kpiCarouselItem: {
    paddingHorizontal: 8,
  },
  kpiCard: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  kpiCardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  kpiIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  kpiCarouselValue: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.gray_900,
    marginBottom: 8,
    textAlign: "center",
  },
  kpiCarouselLabel: {
    fontSize: 14,
    color: theme.colors.gray_600,
    fontWeight: "600",
    textAlign: "center",
  },
  kpiDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  kpiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gray_300,
  },
  kpiDotActive: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },

  // Dashboard de KPIs (antigo - mantendo para compatibilidade)
  kpiRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  kpiItem: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.gray_900,
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: theme.colors.gray_600,
    fontWeight: "500",
  },

  // Carousel de Últimas Vendas
  salesCarouselScroll: {
    marginHorizontal: -18,
  },
  saleCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginHorizontal: 18,
    marginRight: 8,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  saleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  saleInfo: {
    flex: 1,
    marginRight: 12,
  },
  saleProductName: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.gray_900,
    marginBottom: 4,
  },
  saleBuyerName: {
    fontSize: 12,
    color: theme.colors.gray_600,
  },
  saleStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 0,
  },
  saleStatusCompleted: {
    backgroundColor: "#D1FAE5",
  },
  saleStatusPending: {
    backgroundColor: "#FEF3C7",
  },
  saleStatusCancelled: {
    backgroundColor: "#FEE2E2",
  },
  saleStatusText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  saleBody: {
    flexDirection: "row",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: theme.colors.gray_200,
    borderBottomColor: theme.colors.gray_200,
  },
  saleDetail: {
    flex: 1,
    alignItems: "center",
  },
  saleDetailLabel: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginBottom: 4,
  },
  saleDetailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  saleDivider: {
    width: 1,
    backgroundColor: theme.colors.gray_200,
    marginHorizontal: 12,
  },
  saleFooter: {
    marginTop: 12,
    alignItems: "center",
  },
  saleDateText: {
    fontSize: 11,
    color: theme.colors.gray_500,
    fontStyle: "italic",
  },
});
