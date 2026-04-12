import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { ProfileHeader } from "@/features/account/components/ProfileHeader";
import { QuickStats } from "@/features/account/components/QuickStats";
import { AccountMenu } from "@/features/account/components/AccountMenu";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { getOrdersByUser, type Order } from "@/services/ordersStore";
import { appTheme as theme } from "@/theme/appTheme";
import { router } from "expo-router";

export default function AccountScreen() {
  const { user, refreshUser } = useAuth();
  const {
    // States
    displayName,
    farmName,
    farmAddress,
    profilePhotoUri,
    hasNewMessages,
    // Functions
    logout,
    refreshProfileData,
  } = useAccountLogic();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"pagar" | "preparando" | "caminho" | "avaliar">("pagar");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Refresh profile photo and data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
      refreshProfileData();
    }, [refreshUser, refreshProfileData])
  );

  const loadOrdersByStatus = useCallback(async (status: "pagar" | "preparando" | "caminho" | "avaliar") => {
    setIsLoadingOrders(true);
    try {
      const userOrders = await getOrdersByUser(user?.username || "");
      setSelectedStatus(status);
      setModalVisible(true);

      // Mapear status da UI para ordenação/filtro lógico
      let filtered = userOrders;
      if (status === "pagar") {
        filtered = []; // Placeholder
      } else if (status === "preparando") {
        filtered = userOrders.filter(o => o.status === "aguardando");
      } else if (status === "caminho") {
        filtered = userOrders.filter(o => o.status === "transporte");
      } else if (status === "avaliar") {
        filtered = userOrders.filter(o => o.status === "finalizado");
      }

      setOrders(filtered);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [user?.username]);

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <AppHeader
          title="Central"
          onBackPress={() => {}}
          showBackButton={false}
          titleAlign="center"
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          borderColor={theme.colors.gray_200}
        />

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <ProfileHeader 
            profilePhotoUri={profilePhotoUri}
            displayName={displayName}
            farmName={farmName}
            farmAddress={farmAddress}
            onPressEditProfile={() => router.push("/edit-profile")}
          />
          
          <QuickStats 
            rating={4.9}
            completeness={100}
            onPressRating={() => router.push("/ratings")}
          />

          {/* Status de Meus Pedidos */}
          <View style={styles.orderStatusSection}>
            <View style={styles.statusGrid}>
              <OrderStatusCard
                icon="wallet-outline"
                label="À Pagar"
                count={0}
                bgColor="#F8F8F8"
                onPress={() => loadOrdersByStatus("pagar")}
              />
              <OrderStatusCard
                icon="gift-outline"
                label="Preparando"
                count={2}
                bgColor="#F8F8F8"
                onPress={() => loadOrdersByStatus("preparando")}
              />
              <OrderStatusCard
                icon="car-outline"
                label="A Caminho"
                count={1}
                bgColor="#F8F8F8"
                onPress={() => loadOrdersByStatus("caminho")}
              />
              <OrderStatusCard
                icon="star-outline"
                label="Avaliar"
                count={3}
                bgColor="#F8F8F8"
                onPress={() => loadOrdersByStatus("avaliar")}
              />
            </View>
          </View>

          <AccountMenu 
            hasNewMessages={hasNewMessages}
            onLogout={logout}
          />
        </ScrollView>

        {/* Modal de Pedidos por Status */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={[styles.modalContainer, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 20 : 0 }]}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.modalHeader}>
              <View style={{ width: 24 }} />
              <Text style={styles.modalTitle}>
                {selectedStatus === "pagar" && "À Pagar"}
                {selectedStatus === "preparando" && "Preparando"}
                {selectedStatus === "caminho" && "A Caminho"}
                {selectedStatus === "avaliar" && "Avaliar"}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {orders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name={selectedStatus === "avaliar" ? "star-outline" : "checkmark-circle-outline"} 
                  size={48} 
                  color={theme.colors.gray_400} 
                />
                <Text style={styles.emptyText}>
                  {selectedStatus === "pagar" && "Nenhum pedido à pagar"}
                  {selectedStatus === "preparando" && "Todos os pedidos foram preparados!"}
                  {selectedStatus === "caminho" && "Nenhum pedido em transporte no momento"}
                  {selectedStatus === "avaliar" && "Nenhum pedido para avaliar"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <View style={styles.orderItem}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderProduct}>{item.produto}</Text>
                      <Text style={styles.orderBuyer}>De: {item.comprador}</Text>
                      <Text style={styles.orderQuantity}>{item.quantidade}</Text>
                    </View>
                    <View style={styles.orderPrice}>
                      <Text style={styles.price}>{item.valor}</Text>
                      <Text style={styles.date}>{item.data}</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </Modal>

      </SafeAreaView>
    </>
  );
}

// ─── Order Status Card Component ───────────────────────────────────────────

interface OrderStatusCardProps {
  icon: string;
  label: string;
  count: number;
  bgColor: string;
  onPress: () => void;
}

function OrderStatusCard({ icon, label, count, bgColor, onPress }: OrderStatusCardProps) {
  return (
    <TouchableOpacity style={[styles.statusCard, { backgroundColor: bgColor }]} onPress={onPress} activeOpacity={0.75}>
      {count > 0 && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{count}</Text>
        </View>
      )}
      <Ionicons name={icon as never} size={20} color={theme.colors.gray_800} />
      <Text style={styles.statusLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: theme.colors.primary 
  },
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  orderStatusSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  statusCard: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  statusBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.red_500,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  statusLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.gray_800,
    textAlign: "center",
  },

  /* Modal Styles */
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.gray_300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.gray_500,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  orderInfo: {
    flex: 1,
  },
  orderProduct: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  orderBuyer: {
    fontSize: 12,
    color: theme.colors.gray_600,
    marginTop: 2,
  },
  orderQuantity: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
  orderPrice: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  date: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
});
