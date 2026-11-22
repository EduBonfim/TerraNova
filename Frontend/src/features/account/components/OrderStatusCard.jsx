import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function OrderStatusCard({ icon, label, count, onPress }) {
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
      <Ionicons name={icon} size={20} color={theme.colors.gray_800} />
      <Text style={styles.statusLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
