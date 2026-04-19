import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { MARKETPLACE_OPPORTUNITIES } from "@/services/marketplaceStore";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    BackHandler,
    Dimensions,
    Image,
    Modal,
    Platform,
    Pressable,
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
    getNotificationsByRole,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    type AppNotification,
} from "../../services/notificationsStore";
import { appTheme as theme } from "../../theme/appTheme";

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

// ────── Dados ──────────────────────────────────────────────────────────

interface NewsProduct {
  id: string;
  name: string;
  producer: string;
  icon: string;
  bgColor: string;
}

interface RecommendedProduct {
  id: string;
  name: string;
  producer: string;
  price: number;
  icon: string;
  bgColor: string;
}

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
}

const CATEGORIES: CategoryItem[] = [
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

// Dados de notícias reais para a página
const BUYER_NEWS = [
  {
    id: "1",
    title: "Como escolher frutas frescas no marketplace",
    source: "Terra Nova • Hoje",
    icon: "nutrition-outline",
  },
  {
    id: "2",
    title: "Benefícios de consumir alimentos orgânicos",
    source: "Saúde e Bem-estar • Ontem",
    icon: "heart-outline",
  },
  {
    id: "3",
    title: "Receita: Salada de verduras da estação",
    source: "Culinária • 2 dias atrás",
    icon: "leaf-outline",
  },
];

// Get recommended products from marketplace (6 products across all categories)
const getRecommendedProducts = (): RecommendedProduct[] => {
  const mercadoItems = MARKETPLACE_OPPORTUNITIES.filter(p => p.categoria === "Mercado");
  const shuffled = [...mercadoItems].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, 6).map(product => {
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
  const { user, refreshUser } = useAuth();
  const carouselScrollRef = React.useRef<ScrollView>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    getNotificationsByRole("buyer")
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [recommendedProducts] = useState(getRecommendedProducts());

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
        setNotifications(getNotificationsByRole("buyer"));
      };
      syncData();
    }, [refreshUser])
  );

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => {
        const nextIndex = (prev + 1) % recommendedProducts.length;
        // Scroll carousel to next position
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNotifications(getNotificationsByRole("buyer"));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    const categoryName = CATEGORIES.find(c => c.id === categoryId)?.name;
    router.push({
      pathname: "/marketplace",
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

        {/* --- CARROUSEL AUTO ROTATIVO COM SWIPE (5 SEGUNDOS) --- */}
        {recommendedProducts.length > 0 && (
          <View style={[styles.section, { marginTop: 16 }]}>
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
                const index = Math.round(contentOffsetX / (SCREEN_WIDTH - 32 + 12));
                if (index !== currentNewsIndex && index < recommendedProducts.length) {
                  setCurrentNewsIndex(index);
                }
              }}
              style={styles.carouselSwipeScroll}
            >
              {recommendedProducts.map((product, index) => (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.carouselAutoContainer, { width: SCREEN_WIDTH - 32 }]}
                  onPress={() => {
                    router.push({
                      pathname: "/marketplace",
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
                    name={category.icon as any}
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
                onPress={() => router.push({
                  pathname: "/(buyer)/marketplace",
                  params: { highlight: product.id }
                })}
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

          {BUYER_NEWS.map((news) => (
            <TouchableOpacity key={news.id}>
              <SurfaceCard style={styles.newsCard} bordered={false}>
                <View style={styles.newsImagePlaceholder}>
                  <Ionicons
                    name={news.icon as any}
                    size={32}
                    color={theme.colors.gray_500}
                  />
                </View>
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle}>{news.title}</Text>
                  <Text style={styles.newsSource}>{news.source}</Text>
                </View>
              </SurfaceCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* --- NOTIFICAÇÕES MODAL --- */}
      <Modal
        visible={isNotificationsOpen}
        transparent
        animationType="fade"
        onRequestClose={closeNotifications}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={closeNotifications}
        >
          <Pressable
            style={styles.notificationsPanel}
            onPress={() => {}}
          >
            <View style={styles.notificationsHeader}>
              <Text style={styles.notificationsTitle}>Novidades</Text>
              <TouchableOpacity onPress={closeNotifications}>
                <Ionicons
                  name="close"
                  size={20}
                  color={theme.colors.gray_800}
                />
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
                      item.isNew
                        ? styles.notificationDotNew
                        : styles.notificationDotRead,
                    ]}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationItemTitle}>
                    {item.title}
                  </Text>
                  <Text style={styles.notificationItemDescription}>
                    {item.description}
                  </Text>
                </View>
                <Text style={styles.notificationItemTime}>{item.time}</Text>
              </TouchableOpacity>
            ))}

            {hasMoreNotifications ? (
              <TouchableOpacity
                style={styles.viewAllNotificationsButton}
                onPress={openAllNotifications}
              >
                <Text style={styles.viewAllNotificationsText}>
                  Ver todas as notificações
                </Text>
              </TouchableOpacity>
            ) : null}
          </Pressable>
        </Pressable>
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
});
