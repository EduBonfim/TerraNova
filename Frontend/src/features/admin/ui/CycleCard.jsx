import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CycleCard({ title, status, date, type }) {
  const getStatusColor = (currentStatus) => {
    switch (currentStatus.toLowerCase()) {
      case "ativo":
        return "#4caf50";
      case "pendente":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
  };

  return (
    <TouchableOpacity style={styles.card}>
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: getStatusColor(status) },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Ionicons
            name={type === "compost" ? "leaf-outline" : "sync-outline"}
            size={20}
            color="#666"
          />
        </View>

        <Text style={styles.date}>Iniciado em: {date}</Text>

        <View style={styles.footer}>
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            ● {status.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
  },
  statusIndicator: { width: 6 },
  content: { flex: 1, padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#333" },
  date: { fontSize: 14, color: "#777" },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  statusText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
});
