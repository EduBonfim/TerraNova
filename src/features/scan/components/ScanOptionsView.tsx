import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";
import { scanStyles as styles } from "@/features/scan/styles/scan.styles";

interface ScanOptionsViewProps {
  onCapture: () => void;
  onSelectFile: () => void;
}

export function ScanOptionsView({ onCapture, onSelectFile }: ScanOptionsViewProps) {
  return (
    <View style={styles.centerContent}>
      <Ionicons name="document-text" size={80} color={theme.colors.gray_300} style={styles.iconMain} />
      <Text style={styles.title}>Envie o seu Laudo</Text>
      <Text style={styles.subtitle}>
        Tire uma foto ou envie o arquivo do seu laudo. Vamos extrair os dados automaticamente para você revisar.
      </Text>
      <Text style={styles.cropHint}>Use o recorte para enquadrar o documento A4 antes da leitura.</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={onCapture}>
        <Ionicons name="camera-outline" size={24} color={theme.colors.white} style={styles.iconMarginRightLg} />
        <Text style={styles.uploadButtonText}>Tirar Foto do Laudo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onSelectFile}>
        <Ionicons name="folder-open-outline" size={20} color={theme.colors.primary} style={styles.iconMarginRightLg} />
        <Text style={styles.secondaryButtonText}>Escolher Arquivo</Text>
      </TouchableOpacity>
    </View>
  );
}
