import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appTheme as theme } from '@/theme/appTheme';

export type OrderTab = "aguardando" | "transporte" | "finalizado";

export interface OrderItem {
  id: string;
  produto: string;
  valor: string;
  quantidade: string;
  data: string;
  comprador?: string;
  transportadora?: string;
}

interface MyOrdersModalProps {
  visible: boolean;
  onClose: () => void;
  selectedOrderTab: OrderTab;
  setSelectedOrderTab: (tab: OrderTab) => void;
  orders: Record<OrderTab, OrderItem[]>;
}

export function MyOrdersModal({
  visible,
  onClose,
  selectedOrderTab,
  setSelectedOrderTab,
  orders,
}: MyOrdersModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.metricsModalBackdrop}>
        <View style={styles.metricsModalCard}>
          <View style={styles.metricsModalHeader}>
            <Text style={styles.metricsModalTitle}>Minhas Vendas</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.gray_800} />
            </TouchableOpacity>
          </View>

          {/* Tab Buttons */}
          <View style={styles.orderTabsContainer}>
            <TouchableOpacity
              style={[
                styles.orderTab,
                selectedOrderTab === "aguardando" && styles.orderTabActive,
              ]}
              onPress={() => setSelectedOrderTab("aguardando")}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={selectedOrderTab === "aguardando" ? theme.colors.white : theme.colors.gray_500}
              />
              <Text
                style={[
                  styles.orderTabText,
                  selectedOrderTab === "aguardando" && styles.orderTabTextActive,
                ]}
              >
                Aguardando
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.orderTab,
                selectedOrderTab === "transporte" && styles.orderTabActive,
              ]}
              onPress={() => setSelectedOrderTab("transporte")}
            >
              <Ionicons
                name="car-outline"
                size={18}
                color={selectedOrderTab === "transporte" ? theme.colors.white : theme.colors.gray_500}
              />
              <Text
                style={[
                  styles.orderTabText,
                  selectedOrderTab === "transporte" && styles.orderTabTextActive,
                ]}
              >
                Transporte
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.orderTab,
                selectedOrderTab === "finalizado" && styles.orderTabActive,
              ]}
              onPress={() => setSelectedOrderTab("finalizado")}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={selectedOrderTab === "finalizado" ? theme.colors.white : theme.colors.gray_500}
              />
              <Text
                style={[
                  styles.orderTabText,
                  selectedOrderTab === "finalizado" && styles.orderTabTextActive,
                ]}
              >
                Finalizado
              </Text>
            </TouchableOpacity>
          </View>

          {/* Orders List */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.ordersListContainer}>
            {orders[selectedOrderTab].map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View>
                    <Text style={styles.orderCardId}>Pedido #{order.id}</Text>
                    <Text style={styles.orderCardProduct}>{order.produto}</Text>
                  </View>
                  <Text style={styles.orderCardValue}>{order.valor}</Text>
                </View>

                <View style={styles.orderCardDetails}>
                  <View style={styles.orderDetail}>
                    <Ionicons name="cube-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.orderDetailText}>{order.quantidade}</Text>
                  </View>
                  <View style={styles.orderDetail}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.orderDetailText}>{order.data}</Text>
                  </View>
                </View>

                <View style={styles.orderCardFooter}>
                  <Text style={styles.orderBuyer}>
                    {selectedOrderTab === "transporte" ? "Transportadora: " : "Comprador: "}
                    {selectedOrderTab === "transporte" && "transportadora" in order ? order.transportadora : order.comprador}
                  </Text>
                </View>
              </View>
            ))}

            {orders[selectedOrderTab].length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="bag-outline" size={48} color={theme.colors.gray_300} />
                <Text style={styles.emptyStateText}>Nenhuma venda nesta categoria</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  metricsModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  metricsModalCard: {
    maxHeight: "94%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0,
    paddingTop: 14,
    paddingBottom: 20,
  },
  metricsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  metricsModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  // Order Tabs
  orderTabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    gap: 8,
  },
  orderTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
  },
  orderTabActive: {
    backgroundColor: theme.colors.primary,
  },
  orderTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.gray_500,
  },
  orderTabTextActive: {
    color: theme.colors.white,
  },

  // Orders List
  ordersListContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderCardId: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "600",
  },
  orderCardProduct: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginTop: 2,
  },
  orderCardValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  orderCardDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_300,
  },
  orderDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderDetailText: {
    fontSize: 13,
    color: theme.colors.gray_500,
  },
  orderCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderBuyer: {
    fontSize: 13,
    color: theme.colors.gray_500,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.gray_500,
    textAlign: "center",
  },
});
