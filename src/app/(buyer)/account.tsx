import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByUser, type Order } from "@/services/ordersStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
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

// ─── MenuItem component ────────────────────────────────────────────────────────

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: boolean;
  iconBg?: string;
  iconColor?: string;
  rightText?: string;
}

function MenuItem({
  icon,
  label,
  onPress,
  badge,
  iconBg,
  iconColor,
  rightText,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.menuIconContainer,
          iconBg ? { backgroundColor: iconBg } : {},
        ]}
      >
        <Ionicons
          name={icon as never}
          size={22}
          color={iconColor || theme.colors.primary}
        />
        {badge && <View style={styles.notificationDot} />}
      </View>
      <Text style={styles.menuItemText}>{label}</Text>
      {rightText ? (
        <Text style={styles.menuRightText}>{rightText}</Text>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.gray_500}
        />
      )}
    </TouchableOpacity>
  );
}

// ─── MenuCard component ────────────────────────────────────────────────────────

interface MenuCardProps {
  icon: string;
  label: string;
  onPress: () => void;
  iconBg?: string;
  iconColor?: string;
  badge?: boolean;
}

function MenuCard({
  icon,
  label,
  onPress,
  iconBg,
  iconColor,
  badge,
}: MenuCardProps) {
  return (
    <TouchableOpacity
      style={styles.menuCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuCardIconContainer}>
        <Ionicons
          name={icon as never}
          size={18}
          color={theme.colors.gray_800}
        />
        {badge && <View style={styles.menuCardNotificationDot} />}
      </View>
      <Text style={styles.menuCardLabel}>{label}</Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.colors.gray_400}
      />
    </TouchableOpacity>
  );
}

interface PurchaseStatusCardProps {
  icon: string;
  label: string;
  count: number;
  bgColor: string;
  iconColor: string;
  onPress: () => void;
}

function PurchaseStatusCard({
  icon,
  label,
  count,
  bgColor,
  iconColor,
  onPress,
}: PurchaseStatusCardProps) {
  return (
    <TouchableOpacity
      style={styles.statusCard}
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

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function BuyerAccountScreen() {
  const { user, logout, refreshUser } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "pagar" | "preparando" | "caminho" | "avaliar"
  >("pagar");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const loadOrdersByStatus = useCallback(
    async (status: "pagar" | "preparando" | "caminho" | "avaliar") => {
      setIsLoadingOrders(true);
      try {
        const userOrders = await getOrdersByUser(user?.username || "");
        setSelectedStatus(status);
        setModalVisible(true);

        let filtered = userOrders;
        if (status === "pagar") {
          filtered = []; // Placeholder
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

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Refresh user data when screen gains focus (for updated photos)
  useFocusEffect(
    React.useCallback(() => {
      const doRefresh = async () => {
        await refreshUser();
      };
      doRefresh();
    }, [refreshUser]),
  );

  const displayName = user?.fullName || user?.username || "Comprador";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() || "")
    .join("");

  const handleLogout = () => {
    Alert.alert(
      "Confirmar saída",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            await logout();
            router.replace("/");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Central</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Perfil */}
        <View style={styles.profileCard}>
          {user?.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            {user?.email && (
              <Text style={styles.profileEmail}>{user.email}</Text>
            )}
            <View style={styles.buyerBadge}>
              <Ionicons
                name="bag-handle"
                size={11}
                color={theme.colors.orange_500}
              />
              <Text style={styles.buyerBadgeText}>Comprador Terra Nova</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            style={styles.editBtn}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="cart" size={20} color={theme.colors.orange_500} />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Pedidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color={theme.colors.orange_500} />
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Avaliações</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons
              name="chatbubbles"
              size={20}
              color={theme.colors.orange_500}
            />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Chats</Text>
          </View>
        </View>

        {/* Status de Minhas Compras */}
        <View style={styles.purchaseStatusSection}>
          <View style={styles.statusGrid}>
            <PurchaseStatusCard
              icon="wallet-outline"
              label="À Pagar"
              count={1}
              bgColor="#FFF8E1"
              iconColor={theme.colors.orange_500}
              onPress={() => loadOrdersByStatus("pagar")}
            />
            <PurchaseStatusCard
              icon="gift-outline"
              label="Preparando"
              count={0}
              bgColor={theme.colors.lightGreen}
              iconColor={theme.colors.primary}
              onPress={() => loadOrdersByStatus("preparando")}
            />
            <PurchaseStatusCard
              icon="car-outline"
              label="A Caminho"
              count={0}
              bgColor="#E3F2FD"
              iconColor="#2196F3"
              onPress={() => loadOrdersByStatus("caminho")}
            />
            <PurchaseStatusCard
              icon="star-outline"
              label="Avaliar"
              count={8}
              bgColor="#F3E5F5"
              iconColor="#9C27B0"
              onPress={() => loadOrdersByStatus("avaliar")}
            />
          </View>
        </View>

        {/* Minhas Compras */}
        <View style={styles.menuSectionCard}>
          <Text style={styles.menuSectionTitle}>Minhas Compras</Text>
          <View style={styles.menuCardGrid}>
            <MenuCard
              icon="cart-outline"
              label="Meus Pedidos"
              iconBg="#FFF8E1"
              iconColor={theme.colors.orange_500}
              onPress={() => router.push("/my-orders")}
            />
            <MenuCard
              icon="chatbubble-outline"
              label="Chat"
              iconBg={theme.colors.lightGreen}
              iconColor={theme.colors.primary}
              onPress={() => router.push("/messages")}
            />
            <MenuCard
              icon="location-outline"
              label="Meu Endereço"
              iconBg={theme.colors.lightGreen}
              iconColor={theme.colors.primary}
              onPress={() => router.push("/edit-address")}
            />
          </View>
        </View>

        {/* Descobrir */}
        <View style={styles.menuSectionCard}>
          <Text style={styles.menuSectionTitle}>Descobrir</Text>
          <View style={styles.menuCardGrid}>
            <MenuCard
              icon="leaf-outline"
              label="Mundo Orgânico"
              iconBg={theme.colors.lightGreen}
              iconColor={theme.colors.primary}
              onPress={() => router.push("/mundo-organico" as never)}
            />
            <MenuCard
              icon="shield-checkmark-outline"
              label="Certificados"
              iconBg="#F3E5F5"
              iconColor="#9C27B0"
              onPress={() => router.push("/buyer-certificates" as never)}
            />
            <MenuCard
              icon="notifications-outline"
              label="Notificações"
              badge={true}
              iconBg="#FFE0E0"
              iconColor={theme.colors.red_500}
              onPress={() => router.push("/notifications")}
            />
          </View>
        </View>

        {/* Segurança e Moderação */}
        <View style={styles.menuSectionCard}>
          <Text style={styles.menuSectionTitle}>Segurança e Moderação</Text>
          <View style={styles.menuCardGrid}>
            <MenuCard
              icon="heart-outline"
              label="Saúde da Conta"
              iconBg="#FFE0E0"
              iconColor={theme.colors.red_500}
              onPress={() => router.push("/account-health")}
            />
            <MenuCard
              icon="megaphone-outline"
              label="Denúncias"
              iconBg="#FFF8E1"
              iconColor={theme.colors.orange_500}
              onPress={() => router.push("/user-reports")}
            />
          </View>
        </View>

        {/* Conta e Privacidade */}
        <View style={styles.menuSectionCard}>
          <Text style={styles.menuSectionTitle}>Conta e Privacidade</Text>
          <View style={styles.menuCardGrid}>
            <MenuCard
              icon="create-outline"
              label="Editar Perfil"
              iconBg={theme.colors.lightGreen}
              iconColor={theme.colors.primary}
              onPress={() => router.push("/edit-profile")}
            />
            <MenuCard
              icon="lock-closed-outline"
              label="Bloqueio de Mensagens"
              iconBg="#F3E5F5"
              iconColor="#9C27B0"
              onPress={() => router.push("/privacy-settings")}
            />
            <MenuCard
              icon="shield-outline"
              label="Privacidade e LGPD"
              iconBg="#F3E5F5"
              iconColor="#9C27B0"
              onPress={() => router.push("/privacy-lgpd")}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && { opacity: 0.8 }]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={theme.colors.red_500} />
          ) : (
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.red_500}
            />
          )}
          <Text style={styles.logoutText}>
            {isLoggingOut ? "Saindo..." : "Sair da Conta"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
                name={
                  selectedStatus === "avaliar"
                    ? "star-outline"
                    : "checkmark-circle-outline"
                }
                size={48}
                color={theme.colors.gray_400}
              />
              <Text style={styles.emptyText}>
                {selectedStatus === "pagar" && "Nenhum pedido à pagar"}
                {selectedStatus === "preparando" &&
                  "Todos os pedidos foram preparados!"}
                {selectedStatus === "caminho" &&
                  "Nenhum pedido em transporte no momento"}
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
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 17,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  profileEmail: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  buyerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    backgroundColor: "#FFF8E1",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  buyerBadgeText: {
    fontSize: 11,
    color: theme.colors.orange_500,
    fontWeight: "700",
  },
  editBtn: { padding: 6 },

  statsRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  statLabel: { fontSize: 11, color: theme.colors.gray_500 },
  statDivider: { width: 1, backgroundColor: theme.colors.gray_200 },

  purchaseStatusSection: {
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

  menuSection: {
    backgroundColor: theme.colors.white,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.gray_500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },

  menuSectionCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
  },

  menuCardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 2,
  },

  menuCard: {
    width: "49.4%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  menuCardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    position: "relative",
  },

  menuCardNotificationDot: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.red_500,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },

  menuCardLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.gray_800,
    flex: 1,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: theme.colors.red_500,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.gray_800,
    fontWeight: "500",
  },
  menuRightText: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "500",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    marginTop: 4,
  },
  logoutText: { color: theme.colors.red_500, fontSize: 16, fontWeight: "bold" },

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
