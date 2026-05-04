import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { AccountMenu } from "@/features/account/components/AccountMenu";
import { ProfileHeader } from "@/features/account/components/ProfileHeader";
import { QuickStats } from "@/features/account/components/QuickStats";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { calculateProfileCompletion } from "@/features/account/utils/profileCompletion";
import { getAverageRating } from "@/services/communityStore";
import { getOrdersByUser, type Order } from "@/services/ordersStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const { user, refreshUser } = useAuth();
  const {
    displayName,
    farmName,
    farmAddress,
    profilePhotoUri,
    hasNewMessages,
    logout,
    refreshProfileData,
  } = useAccountLogic();

  const { percentage } = calculateProfileCompletion(user);
  const averageRating = user ? getAverageRating(user.username, "producer") : 0;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "pagar" | "preparando" | "caminho" | "avaliar"
  >("pagar");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [counts, setCounts] = useState({
    pagar: 0,
    preparando: 0,
    caminho: 0,
    avaliar: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
      refreshProfileData();
      getOrdersByUser(user?.username || "").then((all) => {
        setCounts({
          pagar: 0,
          preparando: all.filter((o) => o.status === "aguardando").length,
          caminho: all.filter((o) => o.status === "transporte").length,
          avaliar: all.filter((o) => o.status === "finalizado").length,
        });
      });
    }, [refreshUser, refreshProfileData, user?.username]),
  );

  const loadOrdersByStatus = useCallback(
    async (status: "pagar" | "preparando" | "caminho" | "avaliar") => {
      setIsLoadingOrders(true);
      try {
        const userOrders = await getOrdersByUser(user?.username || "");
        setSelectedStatus(status);
        setModalVisible(true);

        let filtered = userOrders;
        if (status === "pagar") {
          filtered = [];
        } else if (status === "preparando") {
          filtered = userOrders.filter((o) => o.status === "aguardando");
        } else if (status === "caminho") {
          filtered = userOrders.filter((o) => o.status === "transporte");
        } else if (status === "avaliar") {
          filtered = userOrders.filter((o) => o.status === "finalizado");
        }

        setOrders(filtered);
      } finally {
        setIsLoadingOrders(false);
      }
    },
    [user?.username],
  );

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.primary}
        />
        <AppHeader
          title="Central"
          onBackPress={() => {}}
          showBackButton={false}
          titleAlign="center"
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          borderColor={theme.colors.gray_200}
        />

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <ProfileHeader
            displayName={displayName}
            farmName={farmName}
            farmAddress={farmAddress}
            profilePhotoUri={profilePhotoUri}
            onPressEditProfile={() => router.push("/edit-profile")}
          />

          {/* Quick Stats */}
          <QuickStats 
            rating={averageRating} 
            completeness={percentage} 
            onPressRating={() => router.push("/ratings")}
            onPressCompleteness={() => router.push("/profile-completion")} 
          />

          {/* Status de Pedidos */}
          <View style={styles.statusSection}>
            <View style={styles.statusGrid}>
              <OrderStatusCard
                icon="wallet-outline"
                label="À Pagar"
                count={counts.pagar}
                bgColor="#F8F8F8"
                onPress={() => loadOrdersByStatus("pagar")}
              />
              <OrderStatusCard
                icon="gift-outline"
                label="Preparando"
                count={counts.preparando}
                bgColor="#F8F8F8"
                onPress={() => loadOrdersByStatus("preparando")}
              />
              <OrderStatusCard
                icon="car-outline"
                label="A Caminho"
                count={counts.caminho}
                bgColor="#F8F8F8"
                onPress={() => loadOrdersByStatus("caminho")}
              />
              <OrderStatusCard
                icon="star-outline"
                label="Avaliar"
                count={counts.avaliar}
                bgColor="#F8F8F8"
                onPress={() => loadOrdersByStatus("avaliar")}
              />
            </View>
          </View>

          <AccountMenu hasNewMessages={hasNewMessages} onLogout={logout} />
        </ScrollView>

        {/* Modal de Pedidos por Status */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContainer,
              {
                paddingTop:
                  Platform.OS === "android" ? StatusBar.currentHeight || 20 : 0,
              },
            ]}
          >
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {selectedStatus === "pagar" && "À Pagar"}
                  {selectedStatus === "preparando" && "Preparando"}
                  {selectedStatus === "caminho" && "A Caminho"}
                  {selectedStatus === "avaliar" && "Finalizados"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {orders.length} pedido{orders.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={theme.colors.gray_600}
                />
              </TouchableOpacity>
            </View>

            {orders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name={
                      selectedStatus === "avaliar"
                        ? "star-outline"
                        : "checkmark-circle-outline"
                    }
                    size={36}
                    color={theme.colors.gray_400}
                  />
                </View>
                <Text style={styles.emptyTitle}>Tudo limpo por aqui!</Text>
                <Text style={styles.emptyText}>
                  {selectedStatus === "pagar" &&
                    "Nenhum pedido aguardando pagamento"}
                  {selectedStatus === "preparando" &&
                    "Nenhum pedido em preparo no momento"}
                  {selectedStatus === "caminho" &&
                    "Nenhum pedido em transporte"}
                  {selectedStatus === "avaliar" &&
                    "Nenhum pedido finalizado ainda"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <OrderCard item={item} role="producer" />
                )}
              />
            )}

            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => {
                setModalVisible(false);
                router.push({
                  pathname: "/my-orders",
                  params: { type: "sales" },
                });
              }}
            >
              <Text style={styles.seeAllText}>Ver todos os pedidos</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

// ─── Order Card (expansível) ─────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  aguardando: "#F59E0B",
  transporte: "#3B82F6",
  finalizado: "#10B981",
  pagar: "#EF4444",
};

const STATUS_ICONS: Record<string, string> = {
  aguardando: "gift-outline",
  transporte: "car-outline",
  finalizado: "checkmark-circle-outline",
  pagar: "wallet-outline",
};

const CATEGORIA_LABELS: Record<string, string> = {
  alimentos: "Alimentos",
  insumos: "Insumos",
  sementes: "Sementes",
  cultivo: "Cultivo",
};

function OrderCard({
  item,
  role,
}: {
  item: Order;
  role: "producer" | "buyer";
}) {
  const [expanded, setExpanded] = useState(false);
  const color = STATUS_COLORS[item.status] || theme.colors.primary;

  return (
    <TouchableOpacity
      style={[styles.orderCard, { borderLeftColor: color }]}
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.75}
    >
      <View style={styles.orderCardMain}>
        <View
          style={[styles.orderStatusIcon, { backgroundColor: color + "20" }]}
        >
          <Ionicons
            name={STATUS_ICONS[item.status] as never}
            size={18}
            color={color}
          />
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderProduct} numberOfLines={1}>
            {item.produto}
          </Text>
          <Text style={styles.orderBuyer}>
            {role === "producer"
              ? `🛒 ${item.comprador}`
              : `🏪 ${item.vendedorUsername}`}
          </Text>
        </View>
        <View style={styles.orderRight}>
          <Text style={[styles.price, { color }]}>{item.valor}</Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={theme.colors.gray_400}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>

      {expanded && (
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={theme.colors.gray_500}
            />
            <Text style={styles.detailText}>Data: {item.data}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="cube-outline"
              size={13}
              color={theme.colors.gray_500}
            />
            <Text style={styles.detailText}>Quantidade: {item.quantidade}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="pricetag-outline"
              size={13}
              color={theme.colors.gray_500}
            />
            <Text style={styles.detailText}>
              Categoria: {CATEGORIA_LABELS[item.categoria] || item.categoria}
            </Text>
          </View>
          {item.transportadora && (
            <View style={styles.detailRow}>
              <Ionicons
                name="car-outline"
                size={13}
                color={theme.colors.gray_500}
              />
              <Text style={styles.detailText}>
                Transportadora: {item.transportadora}
              </Text>
            </View>
          )}
          <View style={[styles.detailRow, { marginTop: 4 }]}>
            <View
              style={[styles.statusChip, { backgroundColor: color + "20" }]}
            >
              <Text style={[styles.statusChipText, { color }]}>
                {item.status === "aguardando" && "Em Preparo"}
                {item.status === "transporte" && "A Caminho"}
                {item.status === "finalizado" && "Entregue"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Order Status Card ────────────────────────────────────────────────────────

interface OrderStatusCardProps {
  icon: string;
  label: string;
  count: number;
  bgColor: string;
  onPress: () => void;
}

function OrderStatusCard({
  icon,
  label,
  count,
  bgColor,
  onPress,
}: OrderStatusCardProps) {
  return (
    <TouchableOpacity
      style={[styles.statusCard, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },

  statusSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 2,
  },
  statusCard: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: theme.colors.white,
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

  /* Modal */
  modalContainer: { flex: 1, backgroundColor: theme.colors.background },
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: theme.colors.gray_800 },
  modalSubtitle: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.gray_700 },
  emptyText: {
    fontSize: 13,
    color: theme.colors.gray_500,
    textAlign: "center",
  },
  listContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },

  /* Order Card */
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  orderCardMain: { flexDirection: "row", alignItems: "center", gap: 10 },
  orderStatusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  orderInfo: { flex: 1 },
  orderProduct: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.gray_800,
  },
  orderBuyer: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  orderRight: { alignItems: "flex-end" },
  price: { fontSize: 14, fontWeight: "700" },
  orderDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_100,
    gap: 6,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 12, color: theme.colors.gray_600 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusChipText: { fontSize: 11, fontWeight: "700" },
  seeAllButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.lightGreen,
    borderWidth: 1,
    borderColor: theme.colors.primary + "30",
  },
  seeAllText: { fontSize: 14, fontWeight: "600", color: theme.colors.primary },
});
