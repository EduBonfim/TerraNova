import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { appTheme as theme } from "@/theme/appTheme";
import { useAuth } from "@/contexts/AuthContext";
import { initFollowStore, getMockFollowing } from "@/services/followStore";
import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";

export default function FavoriteFarmsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        if (user?.username) {
          await initFollowStore(user.username);
          setFollowing(getMockFollowing());
        }
      };
      loadData();
    }, [user])
  );

  const handleFarmPress = (u) => {
    router.push({ pathname: "/user-profile", params: { name: u.name } });
  };

  const renderFarmItem = (u) => (
    <TouchableOpacity
      key={u.id}
      onPress={() => handleFarmPress(u)}
      activeOpacity={0.7}
    >
      <SurfaceCard style={styles.card} bordered={false}>
        <View style={styles.cardContent}>
          <View style={styles.userInfo}>
            <Image source={{ uri: u.avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{u.name}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Text
                  style={[styles.badgeText, { color: theme.colors.primary }]}
                >
                  Produtor Parceiro
                </Text>
              </View>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.gray_300}
          />
        </View>
      </SurfaceCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />

      <AppHeader
        title="Fazendas Favoritas"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      <View style={styles.headerAccent}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{following.length}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="heart" size={20} color={theme.colors.white} />
            <Text style={styles.statLabel}>Acompanhando</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          Produtores e propriedades que você salvou
        </Text>

        {following.length > 0 ? (
          following.map(renderFarmItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="heart-outline"
              size={64}
              color={theme.colors.gray_200}
            />
            <Text style={styles.emptyTitle}>Sua lista está vazia</Text>
            <Text style={styles.emptyText}>
              Favorite fazendas no mercado para encontrá-las aqui rapidamente.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(buyer)/marketplace")}
            >
              <Text style={styles.browseButtonText}>Explorar Mercado</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  content: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: 16 },
  headerAccent: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_500,
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    marginBottom: 10,
    padding: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray_100,
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray_400,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  browseButton: {
    marginTop: 24,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
});
