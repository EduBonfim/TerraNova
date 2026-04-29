import { SurfaceCard } from "@/components/SurfaceCard";
import { type AppReport, updateReportStatus } from "@/services/reportsStore";
import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    statusColor,
    statusLabel,
    adminReportsStyles as styles,
    theme,
} from "../styles/adminReports.styles";

interface ReportListProps {
  reports: AppReport[];
  isLoading: boolean;
  filter: "pendente" | "em_analise" | "resolvido";
  onReportPress: (reportId: string) => void;
  onRefresh: () => void;
}

export function ReportList({
  reports,
  isLoading,
  filter,
  onReportPress,
  onRefresh,
}: ReportListProps) {
  const handleUpdateStatus = async (
    id: string,
    status: "em_analise" | "resolvido",
  ) => {
    await updateReportStatus(id, status);
    onRefresh();
  };

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="shield-checkmark-outline"
          size={48}
          color={theme.colors.gray_200}
        />
        <Text style={styles.emptyText}>Nenhuma denúncia {filter}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => onReportPress(item.id)}
        >
          <SurfaceCard style={styles.card}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.user}>Foco: {item.reportedUser}</Text>
                <Text style={styles.reporterLabel}>Por: {item.reporter}</Text>
              </View>
              <Text
                style={[styles.status, { color: statusColor[item.status] }]}
              >
                {statusLabel[item.status]}
              </Text>
            </View>
            <Text style={styles.reason}>{item.reason}</Text>
            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}
            <View style={styles.actionRow}>
              {item.status === "pendente" && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleUpdateStatus(item.id, "em_analise")}
                >
                  <Ionicons
                    name="search-outline"
                    size={16}
                    color={theme.colors.gray_800}
                  />
                  <Text style={styles.actionText}>Analisar</Text>
                </TouchableOpacity>
              )}
              {item.status !== "resolvido" && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: "rgba(21, 128, 61, 0.1)" },
                  ]}
                  onPress={() => handleUpdateStatus(item.id, "resolvido")}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color={theme.colors.green_700}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      { color: theme.colors.green_700 },
                    ]}
                  >
                    Resolver
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </SurfaceCard>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.content}
    />
  );
}
