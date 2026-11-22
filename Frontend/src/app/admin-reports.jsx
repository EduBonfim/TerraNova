import { AppHeader } from "@/components/AppHeader";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReportDetailScreen } from "@/features/admin/components/ReportDetailScreen";
import { ReportList } from "@/features/admin/components/ReportList";
import { useAdminReports } from "@/features/admin/hooks/useAdminReports";
import {
  adminReportsStyles as styles,
  theme,
} from "@/features/admin/styles/adminReports.styles";

export default function AdminReportsScreen() {
  const router = useRouter();
  const { reports, isLoading, filter, setFilter, loadReports, getReport } =
    useAdminReports();
  const [selectedReport, setSelectedReport] = useState(null);

  const handleReportPress = async (reportId) => {
    const report = await getReport(reportId);
    if (report) {
      setSelectedReport(report);
    }
  };

  if (selectedReport) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.primary}
        />
        <ReportDetailScreen
          report={selectedReport}
          onBack={() => setSelectedReport(null)}
          onReportUpdated={() => {
            setSelectedReport(null);
            loadReports();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Denuncias"
        subtitle="Fila de moderacao e reputacao"
        onBackPress={() => router.back()}
        showBackButton={true}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      {/* Filtros */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.background,
          gap: 8,
        }}
      >
        {["pendente", "em_analise", "resolvido"].map((status) => (
          <TouchableOpacity
            key={status}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              borderWidth: 1,
              borderColor:
                filter === status
                  ? theme.colors.primary
                  : theme.colors.gray_200,
              backgroundColor:
                filter === status ? theme.colors.primary : theme.colors.white,
            }}
            onPress={() => setFilter(status)}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color:
                  filter === status
                    ? theme.colors.white
                    : theme.colors.gray_200,
                textAlign: "center",
              }}
            >
              {status === "pendente"
                ? "Pendentes"
                : status === "em_analise"
                ? "Em Análise"
                : "Resolvidas"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ReportList
        reports={reports}
        isLoading={isLoading}
        filter={filter}
        onReportPress={handleReportPress}
        onRefresh={loadReports}
      />
    </SafeAreaView>
  );
}
