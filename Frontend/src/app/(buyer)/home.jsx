import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  MARKETPLACE_OPPORTUNITIES,
  getMarketplaceItems,
} from "@/services/marketplaceStore";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  getUnacknowledgedWarnings,
  acknowledgeWarning,
} from "@/services/reportsStore";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getBuyerNotifications,
  markAllBuyerNotificationsAsRead,
  markBuyerNotificationAsRead,
  syncBuyerNotifications,
} from "@/services/buyerNotificationsStore";
import { fetchConsumerNews } from "@/services/newsStore";
import { NotificationsModal } from "@/features/home/components/NotificationsModal";
import { appTheme as theme } from "@/theme/appTheme";

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

const CATEGORIES = [
  {
    id: "frutas",
    name: "Frutas",
    icon: "nutrition-outline",
    bgColor: theme.colors.orange_500,
  },
  {
    id: "hortalicas",
    name: "Hortaliças",
    icon: "leaf-outline",
    bgColor: theme.colors.lightGreen,
  },
  {
    id: "legumes",
    name: "Legumes",
    icon: "water-outline",
    bgColor: theme.colors.gray_100,
  },
  {
    id: "graos",
    name: "Grãos",
    icon: "storefront-outline",
    bgColor: theme.colors.brown_500,
  },
];

// Serão carregados dinamicamente via API, mas aqui temos um mock para desenvolvimento offline
const getRecommendedProducts = () => {
  const mercadoItems = MARKETPLACE_OPPORTUNITIES.filter(
    (p) => p.categoria === "Mercado"
  );
  const shuffled = [...mercadoItems].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, 6).map((product) => {
    const priceNum = parseFloat(product.preco.replace("R$ ", ""));
    return {
      id: product.id,
      name: product.produto,
      producer: product.vendedor,
      price: priceNum,
      icon: product.foto,
      bgColor: theme.colors.white,
    };
  });
};

export default function BuyerHomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { user, refreshUser, logout } = useAuth();
  const carouselScrollRef = React.useRef(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(getBuyerNotifications());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [newsList, setNewsList] = useState([]);

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
    fetchConsumerNews().then(setNewsList);
  }, []);
  const [recommendedProducts, setRecommendedProducts] = useState(
    getRecommendedProducts()
  );

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
      const syncData = async () => {
        await refreshUser();

        // Buscar avisos ou suspensões pendentes para este usuário
        if (user?.username) {
          const unacknowledged = await getUnacknowledgedWarnings(user.username);
          setActiveWarnings(unacknowledged);
          if (unacknowledged.length > 0) {
            setCurrentWarning(unacknowledged[0]);
          } else {
            setCurrentWarning(null);
          }
        }

        if (user?.id) {
          await syncBuyerNotifications(user.id);
        }
        setNotifications(getBuyerNotifications());

        await getMarketplaceItems();
        setRecommendedProducts(getRecommendedProducts());
      };
      syncData();
    }, [refreshUser, user?.username])
  );

  // Carrossel auto-rotativo a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => {
        const nextIndex = (prev + 1) % recommendedProducts.length;
        carouselScrollRef.current?.scrollTo({
          x: nextIndex * (SCREEN_WIDTH - 32 + 12),
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [recommendedProducts.length]);

  const latestNotifications = notifications.slice(0, MAX_NOTIFICATION_PREVIEW);
  const hasMoreNotifications = notifications.length > MAX_NOTIFICATION_PREVIEW;
  const unreadCount = notifications.filter((item) => item.isNew).length;

  const openNotifications = () => {
    setIsNotificationsOpen(true);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
    // Marcar todas como lidas ao fechar o modal, garantindo que não sumam enquanto o modal está aberto
    setNotifications(markAllBuyerNotificationsAsRead());
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

    // segurança na rota existente
    if (finalRoute === "/home" || finalRoute === "/profile") {
      return finalRoute === "/profile" ? "/user-profile" : "/(buyer)/home";
    }

    return finalRoute;
  };

  const openNotificationTarget = (item) => {
    // Marca como lida e remove para o histórico
    setNotifications(markBuyerNotificationAsRead(item.id));
    closeNotifications();

    if (item.route === "/profile" && item.targetItemId) {
      router.push({
        pathname: "/user-profile",
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
      if (user?.id) {
        await syncBuyerNotifications(user.id);
      }
      setNotifications(getBuyerNotifications());
      await getMarketplaceItems();
      setRecommendedProducts(getRecommendedProducts());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCategoryPress = (categoryId) => {
    const categoryName = CATEGORIES.find((c) => c.id === categoryId)?.name;
    router.push({
      pathname: "/(buyer)/marketplace",
      params: { category: "Mercado", subcategory: categoryName },
    });
  };

  const displayName = user?.fullName || user?.username || "Comprador";
  const buyerCity = user?.address?.city || "São Paulo";
  const buyerState = user?.address?.state || "SP";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
        translucent={false}
      />
      {/* --- CABEÇALHO DO USUÁRIO --- */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={
              user?.avatarUri
                ? { uri: user.avatarUri }
                : require("../../assets/perfil.png")
            }
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Olá, {displayName}</Text>
            <Text style={styles.location}>
              <Ionicons
                name="location"
                size={12}
                color={theme.colors.primary}
              />{" "}
              {buyerCity}, {buyerState}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={openNotifications}
        >
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
        {/* --- CARROUSEL AUTO ROTATIVO COM SWIPE (5 SEGUNDOS) --- */}
        {recommendedProducts.length > 0 && (
          <View style={styles.section}>
            <ScrollView
              ref={carouselScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              snapToInterval={SCREEN_WIDTH - 32 + 12}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: 16,
              }}
              onScroll={(event) => {
                const contentOffsetX = event.nativeEvent.contentOffset.x;
                const index = Math.round(
                  contentOffsetX / (SCREEN_WIDTH - 32 + 12)
                );
                if (
                  index !== currentNewsIndex &&
                  index < recommendedProducts.length
                ) {
                  setCurrentNewsIndex(index);
                }
              }}
              style={styles.carouselSwipeScroll}
            >
              {recommendedProducts.map((product, _index) => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.carouselAutoContainer,
                    { width: SCREEN_WIDTH - 32 },
                  ]}
                  onPress={() => {
                    router.push({
                      pathname: "/(buyer)/marketplace",
                      params: { highlight: product.id },
                    });
                  }}
                >
                  <Image
                    source={{ uri: product.icon }}
                    style={styles.carouselAutoImage}
                    resizeMode="cover"
                  />
                  <View style={styles.carouselAutoTextContainer}>
                    <Text style={styles.carouselAutoText} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.carouselAutoProducer} numberOfLines={1}>
                      {product.producer}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Carousel dots indicator */}
            <View style={styles.carouselAutoDotsContainer}>
              {recommendedProducts.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.carouselAutoDot,
                    index === currentNewsIndex && styles.carouselAutoDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* --- 4 CATEGORIAS COM ÍCONES --- */}
        <View style={[styles.section, { marginTop: 12 }]}>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryButtonSmall}
                onPress={() => handleCategoryPress(category.id)}
              >
                <View style={styles.categoryIconSmall}>
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color={theme.colors.gray_800}
                  />
                </View>
                <Text style={styles.categoryNameSmall}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- PRODUTOS RECOMENDADOS --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Produtos Recomendados</Text>
          <View style={styles.productsGrid}>
            {recommendedProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productGridCard}
                onPress={() =>
                  router.push({
                    pathname: "/(buyer)/marketplace",
                    params: { highlight: product.id },
                  })
                }
              >
                <SurfaceCard style={styles.productCard} bordered={false}>
                  <Image
                    source={{ uri: product.icon }}
                    style={styles.productImage}
                  />
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productProducer} numberOfLines={1}>
                    {product.producer}
                  </Text>
                  <Text style={styles.productPrice}>
                    R$ {product.price.toFixed(2)}
                  </Text>
                </SurfaceCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- NOTÍCIAS E DESTAQUES --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📰 Notícias e Destaques</Text>

          {newsList.length > 0 ? (
            newsList.slice(0, 3).map((news) => (
              <TouchableOpacity
                key={news.id}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(news.link).catch(console.error)}
              >
                <SurfaceCard style={styles.newsCard} bordered={false}>
                  {news.imageUrl ? (
                    <Image
                      source={{ uri: news.imageUrl }}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 8,
                        marginRight: 16,
                      }}
                    />
                  ) : (
                    <View style={styles.newsImagePlaceholder}>
                      <Ionicons
                        name="nutrition-outline"
                        size={32}
                        color={theme.colors.gray_500}
                      />
                    </View>
                  )}
                  <View style={styles.newsContent}>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                      {news.title}
                    </Text>
                    <Text style={styles.newsSource}>
                      {news.source} • {news.date}
                    </Text>
                  </View>
                </SurfaceCard>
              </TouchableOpacity>
            ))
          ) : (
            <SurfaceCard style={styles.newsCard} bordered={false}>
              <View style={styles.newsImagePlaceholder}>
                <Ionicons
                  name="earth"
                  size={32}
                  color={theme.colors.gray_500}
                />
              </View>
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>
                  Nenhuma notícia carregada no momento
                </Text>
                <Text style={styles.newsSource}>Verifique sua conexão</Text>
              </View>
            </SurfaceCard>
          )}
        </View>
      </ScrollView>

      {/* --- NOTIFICAÇÕES MODAL --- */}
      <NotificationsModal
        isNotificationsOpen={isNotificationsOpen}
        closeNotifications={closeNotifications}
        latestNotifications={latestNotifications}
        hasMoreNotifications={hasMoreNotifications}
        openNotificationTarget={openNotificationTarget}
        openAllNotifications={openAllNotifications}
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
        <View style={styles.warningModalBackdrop}>
          <View style={styles.warningModalContent}>
            <View
              style={[
                styles.warningIconContainer,
                currentWarning?.action?.type === "bloqueio" ||
                currentWarning?.action?.type === "bloqueio_temporario"
                  ? styles.warningIconContainerBan
                  : styles.warningIconContainerWarning,
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

            <Text style={styles.warningModalTitle}>
              {currentWarning?.action?.type === "bloqueio" ||
              currentWarning?.action?.type === "bloqueio_temporario"
                ? "Sua conta foi suspensa!"
                : "Você foi denunciado!"}
            </Text>

            <Text style={styles.warningSubtitle}>
              {currentWarning?.action?.type === "bloqueio" ||
              currentWarning?.action?.type === "bloqueio_temporario"
                ? "A moderação aplicou uma suspensão na sua conta por violação dos termos de uso."
                : "A moderação do Terra Nova enviou um aviso sobre o seu comportamento no app."}
            </Text>

            <View style={styles.warningDetailsBox}>
              <View style={styles.warningDetailRow}>
                <Text style={styles.warningDetailLabel}>Motivo:</Text>
                <Text style={styles.warningDetailValue}>
                  {currentWarning?.reason}
                </Text>
              </View>

              {currentWarning?.description ? (
                <View style={styles.warningDetailRow}>
                  <Text style={styles.warningDetailLabel}>Descrição:</Text>
                  <Text style={styles.warningDetailValueText}>
                    {currentWarning.description}
                  </Text>
                </View>
              ) : null}

              <View style={styles.warningDetailRow}>
                <Text style={styles.warningDetailLabel}>Decisão:</Text>
                <Text
                  style={[
                    styles.warningDetailValueBadge,
                    currentWarning?.action?.type === "bloqueio" ||
                    currentWarning?.action?.type === "bloqueio_temporario"
                      ? styles.warningBadgeBan
                      : styles.warningBadgeWarning,
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
                    styles.warningDetailRow,
                    {
                      borderTopWidth: 1,
                      borderTopColor: theme.colors.gray_200,
                      paddingTop: 10,
                      marginTop: 5,
                    },
                  ]}
                >
                  <Text style={styles.warningDetailLabel}>Detalhes:</Text>
                  <Text style={styles.warningDetailValueText}>
                    {currentWarning.action.details}
                  </Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.warningConfirmButton,
                currentWarning?.action?.type === "bloqueio" ||
                currentWarning?.action?.type === "bloqueio_temporario"
                  ? styles.warningConfirmButtonBan
                  : styles.warningConfirmButtonWarning,
              ]}
              onPress={handleAcknowledgeWarning}
            >
              <Text style={styles.warningConfirmButtonText}>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: CURRENT_PLATFORM_UI.headerPaddingBottom,
    paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop,
    backgroundColor: theme.colors.primary,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.white,
  },
  location: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  notificationIcon: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: theme.colors.red_500,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  carouselContainer: {
    marginHorizontal: -16,
  },
  carousel: {
    marginHorizontal: 16,
  },
  carouselItem: {
    paddingHorizontal: 0,
  },
  carouselCard: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    gap: 16,
  },
  carouselImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  carouselContent: {
    flex: 1,
  },
  carouselProductName: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.gray_800,
    marginBottom: 4,
  },
  carouselProducerName: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginBottom: 10,
  },
  carouselButtonBrowse: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  carouselButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  carouselDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.gray_300,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },
  carouselSwipeScroll: {
    // ScrollView ocupará a largura total da view
    marginHorizontal: -16,
  },
  carouselAutoContainer: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    marginRight: 12,
  },
  carouselAutoImage: {
    width: "100%",
    height: "100%",
  },
  carouselAutoTextContainer: {
    position: "absolute",
    bottom: 40,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 8,
    maxWidth: "60%",
  },
  carouselAutoText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.white,
    marginBottom: 2,
  },
  carouselAutoProducer: {
    fontSize: 10,
    color: theme.colors.gray_300,
  },
  carouselAutoDotsContainer: {
    position: "absolute",
    bottom: 12,
    left: "50%",
    transform: [{ translateX: -40 }],
    flexDirection: "row",
    gap: 6,
  },
  carouselAutoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.gray_400,
  },
  carouselAutoDotActive: {
    backgroundColor: theme.colors.white,
    width: 16,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  categoryButtonSmall: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  categoryIconSmall: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryNameSmall: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.gray_800,
    textAlign: "center",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    justifyContent: "space-between",
  },
  productGridCard: {
    width: "32.6%",
  },
  productCard: {
    padding: 12,
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.gray_200,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
    textAlign: "center",
    minHeight: 32,
    marginBottom: 4,
  },
  productProducer: {
    fontSize: 11,
    color: theme.colors.gray_500,
    textAlign: "center",
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  newsCard: {
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    padding: 0,
  },
  newsImagePlaceholder: {
    width: 100,
    minHeight: 100,
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
  newsSource: {
    fontSize: 12,
    color: theme.colors.gray_500,
  },
  newsPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  notificationsPanel: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
    paddingBottom: 20,
  },
  notificationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  notificationItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_100,
    alignItems: "flex-start",
  },
  notificationDotWrap: {
    width: 12,
    height: 12,
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationDotNew: {
    backgroundColor: theme.colors.primary,
  },
  notificationDotRead: {
    backgroundColor: theme.colors.gray_300,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  notificationItemDescription: {
    fontSize: 12,
    color: theme.colors.gray_600,
    marginTop: 2,
  },
  notificationItemTime: {
    fontSize: 11,
    color: theme.colors.gray_400,
    marginLeft: 8,
  },
  viewAllNotificationsButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    alignItems: "center",
  },
  viewAllNotificationsText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
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
