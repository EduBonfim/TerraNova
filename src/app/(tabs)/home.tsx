import { useAuth } from "@/contexts/AuthContext";
import { getProfileSummary, initCommunityStore, refreshCommunityStore } from "@/services/communityStore";
import {
    getNotificationsByRole,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    type AppNotification,
} from "@/services/notificationsStore";
import { appTheme as theme } from "@/theme/appTheme";
import { getProducerKPIs, getRecentSales, type ProducerKPI, type RecentSale } from "@/utils/producerAnalytics";
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    BackHandler,
    RefreshControl,
    ScrollView,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import modular components
import { homeStyles as styles } from "@/features/home/styles/home.styles";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { KpiCarousel } from "@/features/home/components/KpiCarousel";
import { MarketOpportunities } from "@/features/home/components/MarketOpportunities";
import { QuickActions } from "@/features/home/components/QuickActions";
import { RecentSales } from "@/features/home/components/RecentSales";
import { AgroNews } from "@/features/home/components/AgroNews";
import { NotificationsModal } from "@/features/home/components/NotificationsModal";

const MAX_NOTIFICATION_PREVIEW = 5;

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
        <HomeHeader
          profileSummary={profileSummary}
          unreadCount={unreadCount}
          openNotifications={openNotifications}
        />

        <KpiCarousel kpis={kpis} />

        <MarketOpportunities />

        <QuickActions />

        <RecentSales recentSales={recentSales} />

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
    </SafeAreaView>
  );
}
