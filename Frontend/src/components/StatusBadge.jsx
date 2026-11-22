import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export const StatusBadge = ({ status, size = "md" }) => {
  const config = {
    aguardando: {
      color: "#FFA500",
      bgColor: "#FFF4E6",
      icon: "time-outline",
      label: "Aguardando",
    },
    transporte: {
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      icon: "car-outline",
      label: "Em Trânsito",
    },
    finalizado: {
      color: "#10B981",
      bgColor: "#ECFDF5",
      icon: "checkmark-circle-outline",
      label: "Finalizado",
    },
  };

  const cfg = config[status];
  const sizeStyles = {
    sm: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      fontSize: 10,
      iconSize: 12,
    },
    md: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      fontSize: 12,
      iconSize: 14,
    },
    lg: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 13,
      iconSize: 16,
    },
  };

  const sz = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: cfg.bgColor,
          paddingVertical: sz.paddingVertical,
          paddingHorizontal: sz.paddingHorizontal,
        },
      ]}
    >
      <Ionicons name={cfg.icon} size={sz.iconSize} color={cfg.color} />
      <Text
        style={[styles.badgeText, { fontSize: sz.fontSize, color: cfg.color }]}
      >
        {cfg.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontWeight: "600",
  },
});
