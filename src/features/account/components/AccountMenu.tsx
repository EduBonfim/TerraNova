import { platformMetrics, appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface AccountMenuProps {
  hasNewMessages: boolean;
  onLogout: () => Promise<void>;
}

interface MenuCardProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: boolean;
}

function MenuCard({ icon, label, onPress, badge }: MenuCardProps) {
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

export function AccountMenu({ hasNewMessages, onLogout }: AccountMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <>
      {/* Minha Atividade */}
      <View style={styles.menuSectionCard}>
        <Text style={styles.menuSectionTitle}>Minha Atividade</Text>
        <View style={styles.menuCardGrid}>
          <MenuCard
            icon="document-text-outline"
            label="Meus Laudos"
            onPress={() => router.push("/soil-reports")}
          />
          <MenuCard
            icon="cart-outline"
            label="Minhas Vendas"
            onPress={() => router.push({ pathname: "/my-orders", params: { type: "sales" } })}
          />
          <MenuCard
            icon="bag-outline"
            label="Minhas Compras"
            onPress={() => router.push({ pathname: "/my-orders", params: { type: "purchases" } })}
          />
          <MenuCard
            icon="pricetags-outline"
            label="Meus Anúncios"
            onPress={() => router.push("/stock")}
          />
          <MenuCard
            icon="chatbubble-outline"
            label="Chat"
            badge={hasNewMessages}
            onPress={() => router.push("/messages")}
          />
          <MenuCard
            icon="people-outline"
            label="Comunidade"
            onPress={() => router.push("/(producer)/follows")}
          />
          <MenuCard
            icon="shield-checkmark-outline"
            label="Certificados MAPA"
            onPress={() => router.push("/certificates")}
          />
          <MenuCard
            icon="car-outline"
            label="Transporte e Frete"
            onPress={() => router.push("/transport")}
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
            onPress={() => router.push("/account-health")}
          />
          <MenuCard
            icon="megaphone-outline"
            label="Denúncias"
            onPress={() => router.push("/user-reports")}
          />
        </View>
      </View>

      {/* Descubra */}
      <View style={styles.menuSectionCard}>
        <Text style={styles.menuSectionTitle}>Descubra</Text>
        <View style={styles.menuCardGrid}>
          <MenuCard
            icon="leaf-outline"
            label="Seja Orgânico!"
            onPress={() => router.push("/seja-organico" as never)}
          />
          <MenuCard
            icon="bar-chart-outline"
            label="Relatórios e Métricas"
            onPress={() => router.push("/sales-metrics")}
          />
        </View>
      </View>

      {/* Configurações */}
      <View style={styles.menuSectionCard}>
        <Text style={styles.menuSectionTitle}>Configurações</Text>
        <View style={styles.menuCardGrid}>
          <MenuCard
            icon="lock-closed-outline"
            label="Bloqueio de Mensagens"
            onPress={() => router.push("/privacy-settings")}
          />
          <MenuCard
            icon="shield-outline"
            label="Privacidade e LGPD"
            onPress={() => router.push("/privacy-lgpd")}
          />
          <MenuCard
            icon="create-outline"
            label="Editar Perfil"
            onPress={() => router.push("/edit-profile")}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, isLoggingOut && { opacity: 0.8 }]}
        disabled={isLoggingOut}
        onPress={() => {
          Alert.alert(
            "Confirmar",
            "Tem certeza que deseja sair da sua conta?",
            [
              { text: "Cancelar", onPress: () => {}, style: "cancel" },
              {
                text: "Sair",
                onPress: async () => {
                  setIsLoggingOut(true);
                  await new Promise((resolve) => setTimeout(resolve, 3000));
                  await onLogout();
                  router.replace("/");
                },
                style: "destructive",
              },
            ],
          );
        }}
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

      <View style={styles.logoutSpacer} />
    </>
  );
}

const styles = StyleSheet.create({
  menuSectionCard: {
    marginTop: 12,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.gray_500,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuCardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 2,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  menuCardLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.gray_800,
    marginRight: 8,
  },
  menuCardNotificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.red_500,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 10,
  },
  logoutText: {
    color: theme.colors.red_500,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  logoutSpacer: { height: platformMetrics.accountScreen.logoutBottomSpacer },
});
