import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { appTheme as theme } from "@/theme/appTheme";
import { useAuth } from "@/contexts/AuthContext";
import { initFollowStore, getMockFollowers, getMockFollowing, getRealFollowers } from "@/services/followStore";
import { getAllOrders } from "@/services/ordersStore";
import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";

export default function FollowsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [insights, setInsights] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        if (user?.username) {
          await initFollowStore(user.username);
          const realFollowers = await getRealFollowers(user.username);
          setFollowers(realFollowers);
          setFollowing(getMockFollowing());
        }
      };
      loadData();
    }, [user])
  );

  const handleUserPress = async (u: any) => {
    if (u.type === "Produtor") {
      router.push({ pathname: "/user-profile", params: { name: u.name } });
    } else {
      const allOrders = await getAllOrders();
      const userOrders = allOrders.filter(o => o.comprador.toLowerCase() === u.name.toLowerCase());
      
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.valorNumerico || 0), 0);
      const averageTicket = userOrders.length > 0 ? totalSpent / userOrders.length : 0;
      
      const productCounts: Record<string, number> = {};
      userOrders.forEach(o => {
        productCounts[o.produto] = (productCounts[o.produto] || 0) + 1;
      });
      
      const mostBought = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Nenhum ainda";

      // Lógica de Status de Fidelidade
      let loyaltyStatus = "Novo";
      if (userOrders.length > 5) loyaltyStatus = "VIP";
      else if (userOrders.length > 2) loyaltyStatus = "Recorrente";
      else if (userOrders.length === 0) loyaltyStatus = "Prospecto";

      setInsights({
        totalOrders: userOrders.length,
        totalSpent: totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        averageTicket: averageTicket.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        mostBought: mostBought,
        loyaltyStatus: loyaltyStatus,
        lastOrder: userOrders.sort((a, b) => b.data.localeCompare(a.data))[0]?.data || "N/A"
      });
      setSelectedUser(u);
    }
  };

  const renderUserItem = (u: any) => (
    <TouchableOpacity 
      key={u.id} 
      onPress={() => handleUserPress(u)}
      activeOpacity={0.7}
    >
      <SurfaceCard style={styles.card} bordered={false}>
        <View style={styles.cardContent}>
          <View style={styles.userInfo}>
            <Image source={{ uri: u.avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{u.name}</Text>
              <View style={[styles.badge, { backgroundColor: u.type === "Produtor" ? theme.colors.primary + "15" : theme.colors.orange_500 + "15" }]}>
                <Text style={[styles.badgeText, { color: u.type === "Produtor" ? theme.colors.primary : theme.colors.orange_500 }]}>{u.type}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.gray_300} />
        </View>
      </SurfaceCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <AppHeader 
        title="Comunidade" 
        onBackPress={() => router.back()} 
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      {/* Tabs Customizada Premium */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "followers" && styles.activeTab]}
            onPress={() => setActiveTab("followers")}
          >
            <Text style={[styles.tabText, activeTab === "followers" && styles.activeTabText]}>
              Seguidores ({followers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "following" && styles.activeTab]}
            onPress={() => setActiveTab("following")}
          >
            <Text style={[styles.tabText, activeTab === "following" && styles.activeTabText]}>
              Seguindo ({following.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          {activeTab === "followers" ? "Quem acompanha sua fazenda" : "Contas que você acompanha"}
        </Text>
        
        {activeTab === "followers" ? (
          followers.length > 0 ? (
            followers.map(renderUserItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={theme.colors.gray_200} />
              <Text style={styles.emptyText}>Você ainda não tem seguidores.</Text>
            </View>
          )
        ) : (
          following.length > 0 ? (
            following.map(renderUserItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={48} color={theme.colors.gray_200} />
              <Text style={styles.emptyText}>Você não segue ninguém ainda.</Text>
              <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => router.push("/marketplace")}
              >
                <Text style={styles.browseButtonText}>Explorar Mercado</Text>
              </TouchableOpacity>
            </View>
          )
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal de Insights Premium */}
      <Modal
        visible={!!selectedUser}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Insights do Cliente</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedUser(null)}>
                <Ionicons name="close" size={20} color={theme.colors.gray_600} />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <View style={styles.modalProfile}>
                <Image source={{ uri: selectedUser.avatar }} style={styles.modalAvatar} />
                <View style={styles.modalProfileText}>
                  <Text style={styles.modalName}>{selectedUser.name}</Text>
                  <View style={styles.loyaltyRow}>
                    <Text style={styles.modalType}>{selectedUser.type}</Text>
                    {insights && (
                      <View style={[styles.loyaltyBadge, { backgroundColor: insights.loyaltyStatus === "VIP" ? "#FFD70020" : theme.colors.primary + "15" }]}>
                        <Ionicons 
                          name={insights.loyaltyStatus === "VIP" ? "ribbon" : "person-outline"} 
                          size={10} 
                          color={insights.loyaltyStatus === "VIP" ? "#B8860B" : theme.colors.primary} 
                        />
                        <Text style={[styles.loyaltyBadgeText, { color: insights.loyaltyStatus === "VIP" ? "#B8860B" : theme.colors.primary }]}>
                          {insights.loyaltyStatus}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {insights && (
              <View style={styles.insightsContainer}>
                <View style={styles.mainInsight}>
                  <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.insightLabel}>Total Vendido</Text>
                      <Text style={styles.insightValue}>{insights.totalSpent}</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: theme.colors.gray_100, marginHorizontal: 16 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.insightLabel}>Ticket Médio</Text>
                      <Text style={styles.insightValueSmall}>{insights.averageTicket}</Text>
                    </View>
                  </View>
                  <View style={styles.insightBadge}>
                    <Text style={styles.insightBadgeText}>{insights.totalOrders} pedidos realizados</Text>
                  </View>
                </View>

                <View style={styles.gridInsights}>
                  <View style={styles.gridItem}>
                    <Ionicons name="star" size={16} color={theme.colors.orange_500} style={{ marginBottom: 4 }} />
                    <Text style={styles.gridLabel}>Favorito</Text>
                    <Text style={styles.gridValue} numberOfLines={1}>{insights.mostBought}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Ionicons name="calendar" size={16} color={theme.colors.primary} style={{ marginBottom: 4 }} />
                    <Text style={styles.gridLabel}>Última Vez</Text>
                    <Text style={styles.gridValue}>{insights.lastOrder}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.chatButton}
                onPress={() => {
                  const nameToOpen = selectedUser.name;
                  setSelectedUser(null);
                  router.push({
                    pathname: "/messages",
                    params: { sellerName: nameToOpen }
                  });
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={20} color="white" />
                <Text style={styles.chatButtonText}>Abrir Chat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => setSelectedUser(null)}
              >
                <Text style={styles.secondaryButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  content: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_500,
    marginBottom: 16,
    marginTop: 8,
  },
  tabsContainer: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  activeTabText: {
    color: theme.colors.primary,
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
  
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_900,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
  },
  modalProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  modalProfileText: {
    flex: 1,
  },
  modalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_900,
  },
  loyaltyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  modalType: {
    fontSize: 13,
    color: theme.colors.gray_500,
  },
  loyaltyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  loyaltyBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  insightsContainer: {
    gap: 12,
  },
  mainInsight: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.gray_100,
  },
  insightLabel: {
    fontSize: 10,
    color: theme.colors.gray_500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  insightValueSmall: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  insightBadge: {
    marginTop: 4,
    backgroundColor: theme.colors.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  insightBadgeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  gridInsights: {
    flexDirection: "row",
    gap: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray_100,
  },
  gridLabel: {
    fontSize: 9,
    color: theme.colors.gray_500,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.gray_800,
  },
  modalActions: {
    marginTop: 24,
    gap: 10,
  },
  chatButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  chatButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: theme.colors.gray_500,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray_400,
    marginTop: 12,
    textAlign: "center",
  },
  browseButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary + "15",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  browseButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
});
