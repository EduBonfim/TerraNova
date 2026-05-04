import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { BuyerAccountMenu } from "@/features/account/components/BuyerAccountMenu";
import { BuyerOrderCard } from "@/features/account/components/BuyerOrderCard";
import { BuyerProfileHeader } from "@/features/account/components/BuyerProfileHeader";
import { OrderStatusCard } from "@/features/account/components/OrderStatusCard";
import { QuickStats } from "@/features/account/components/QuickStats";
import { useBuyerOrders } from "@/features/account/hooks/useBuyerOrders";
import { calculateProfileCompletion } from "@/features/account/utils/profileCompletion";
import { getAverageRating } from "@/services/communityStore";
import { buyerAccountStyles as styles } from "@/features/account/styles/buyerAccountStyles";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React from "react";
import {
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BuyerAccountScreen() {
  const { user, logout, refreshUser } = useAuth();
  const {
    modalVisible,
    setModalVisible,
    selectedStatus,
    orders,
    counts,
    loadOrdersByStatus,
    refreshCounts,
  } = useBuyerOrders(user?.username);

  const displayName = user?.fullName || user?.username || "Consumidor";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() || "")
    .join("");

  const { percentage } = calculateProfileCompletion(user);
  const averageRating = user ? getAverageRating(user.username, "buyer") : 0;

  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
      if (user?.username) {
        refreshCounts(user.username);
      }
    }, [refreshUser, user?.username, refreshCounts])
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
          <BuyerProfileHeader
            displayName={displayName}
            email={user?.email || ""}
            profilePhotoUri={user?.avatarUri || null}
            initials={initials}
            onPressEditProfile={() => router.push("/edit-profile")}
          />

          <QuickStats
            rating={averageRating}
            completeness={percentage}
            onPressRating={() => router.push("/ratings")}
            onPressCompleteness={() => router.push("/profile-completion")}
          />

          <View style={styles.statusSection}>
            <View style={styles.statusGrid}>
              <OrderStatusCard
                icon="wallet-outline"
                label="À Pagar"
                count={counts.pagar}
                onPress={() => loadOrdersByStatus("pagar")}
              />
              <OrderStatusCard
                icon="gift-outline"
                label="Preparando"
                count={counts.preparando}
                onPress={() => loadOrdersByStatus("preparando")}
              />
              <OrderStatusCard
                icon="car-outline"
                label="A Caminho"
                count={counts.caminho}
                onPress={() => loadOrdersByStatus("caminho")}
              />
              <OrderStatusCard
                icon="star-outline"
                label="Avaliar"
                count={counts.avaliar}
                onPress={() => loadOrdersByStatus("avaliar")}
              />
            </View>
          </View>

          <BuyerAccountMenu onLogout={logout} />
        </ScrollView>

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
                    "Nenhum pedido sendo preparado"}
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
                renderItem={({ item }) => <BuyerOrderCard item={item} />}
              />
            )}

            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => {
                setModalVisible(false);
                router.push("/my-orders");
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
