import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";
import { scanStyles as styles } from "@/features/scan/styles/scan.styles";

export function ScanningFeedbackView() {
  return (
    <View style={styles.centerContent}>
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.loadingIndicator}
      />
      <Text style={styles.title}>Analisando o laudo...</Text>
      <Text style={styles.subtitle}>
        Estamos lendo os parâmetros para pré-preencher os campos.
      </Text>
    </View>
  );
}
