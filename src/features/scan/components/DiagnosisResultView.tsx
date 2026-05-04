import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SurfaceCard } from "@/components/SurfaceCard";
import { appTheme as theme } from "@/theme/appTheme";
import type { SoilReport } from "@/services/soilReportsStore";
import { scanStyles as styles } from "@/features/scan/styles/scan.styles";

interface DiagnosisResultViewProps {
  carencias: string[];
  duplicateReport: SoilReport | null;
  isSaving: boolean;
  savedReportId: string | null;
  onSaveAndGoToMap: () => void;
  onSaveOnly: () => void;
  onViewReports: () => void;
  onRestart: () => void;
}

export function DiagnosisResultView({
  carencias,
  duplicateReport,
  isSaving,
  savedReportId,
  onSaveAndGoToMap,
  onSaveOnly,
  onViewReports,
  onRestart
}: DiagnosisResultViewProps) {
  return (
    <View style={styles.centerContent}>
      <View style={styles.successIconCircle}>
        <Ionicons name="analytics" size={40} color={theme.colors.white} />
      </View>
      <Text style={styles.title}>Diagnóstico Pronto!</Text>

      <SurfaceCard style={styles.resultCard}>
        <Text style={styles.resultCardTitle}>Problemas Identificados:</Text>
        {duplicateReport ? (
          <View style={styles.duplicateBadge}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
            <Text style={styles.duplicateBadgeText}>Laudo semelhante já salvo no perfil</Text>
          </View>
        ) : null}
        {carencias.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.resultItem}>
            <Ionicons name="warning-outline" size={20} color={theme.colors.orange_500} />
            <Text style={styles.resultText}>{item}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.recommendationTitle}>Ação Recomendada:</Text>
        <Text style={styles.recommendationText}>
          Priorize insumos orgânicos para corrigir os pontos críticos e depois abra o mapa para negociar com fornecedores próximos.
        </Text>
      </SurfaceCard>

      <TouchableOpacity style={styles.matchButton} onPress={onSaveAndGoToMap}>
        <Ionicons name="map-outline" size={20} color={theme.colors.white} style={styles.iconMarginRightSm} />
        <Text style={styles.matchButtonText}>Salvar e Buscar Insumos no Mapa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveOnlyButton, isSaving ? styles.saveOnlyButtonDisabled : null]}
        disabled={isSaving || !!duplicateReport}
        onPress={onSaveOnly}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Ionicons name="save-outline" size={20} color={theme.colors.primary} style={styles.iconMarginRightSm} />
        )}
        <Text style={styles.saveOnlyButtonText}>
          {duplicateReport ? "Já salvo (duplicado)" : savedReportId ? "Laudo já salvo" : "Salvar somente no Perfil"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewReportsButton} onPress={onViewReports}>
        <Text style={styles.viewReportsButtonText}>Ver Meus Laudos de Solo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
        <Text style={styles.restartButtonText}>Analisar novo laudo</Text>
      </TouchableOpacity>
    </View>
  );
}
