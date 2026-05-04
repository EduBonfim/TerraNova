import { appTheme as theme } from "@/theme/appTheme";
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

interface BuyerAccountMenuProps {
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

export function BuyerAccountMenu({ onLogout }: BuyerAccountMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
            try {
              await onLogout();
              router.replace("/");
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  return (
    <>
      {/* Minhas Compras */}
      <View style={styles.menuSectionCard}>
        <Text style={styles.menuSectionTitle}>Minhas Compras</Text>
        <View style={styles.menuCardGrid}>
          <MenuCard
            icon="cart-outline"
            label="Meus Pedidos"
            onPress={() => router.push("/my-orders")}
          />
          <MenuCard
            icon="location-outline"
            label="Meu Endereço"
            onPress={() => router.push("/edit-address")}
          />
          <MenuCard
            icon="heart-outline"
            label="Fazendas favoritas"
            onPress={() => router.push("/(buyer)/favorite-farms")}
          />
          <MenuCard
            icon="chatbubble-outline"
            label="Chat"
            onPress={() => router.push("/messages")}
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
            onPress={() => router.push("/mundo-organico" as never)}
          />
          <MenuCard
            icon="shield-checkmark-outline"
            label="Certificados"
            onPress={() => router.push("/buyer-certificates" as never)}
          />
          <MenuCard
            icon="notifications-outline"
            label="Notificações"
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
            onPress={() => router.push("/account-health")}
          />
          <MenuCard
            icon="megaphone-outline"
            label="Denúncias"
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
            onPress={() => router.push("/edit-profile")}
          />
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
    </>
  );
}

const styles = StyleSheet.create({
  menuSectionCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.gray_500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingBottom: 8,
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
    borderRadius: 8,
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
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    marginTop: 4,
  },
  logoutText: {
    color: theme.colors.red_500,
    fontSize: 16,
    fontWeight: "bold",
  },
});
