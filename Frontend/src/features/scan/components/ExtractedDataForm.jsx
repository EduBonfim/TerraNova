import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";
import { scanStyles as styles } from "@/features/scan/styles/scan.styles";
import { SurfaceCard } from "@/components/SurfaceCard";

export function ExtractedDataForm({
  imagemUri,
  confiancaLeitura,
  onRetake,
  ph,
  setPh,
  materiaOrganica,
  setMateriaOrganica,
  ctc,
  setCtc,
  vBase,
  setVBase,
  fosforo,
  setFosforo,
  potassio,
  setPotassio,
  calcio,
  setCalcio,
  magnesio,
  setMagnesio,
  aluminio,
  setAluminio,
  onConfirm,
}) {
  return (
    <View style={styles.formContent}>
      <View style={styles.warningBox}>
        <Ionicons name="warning" size={24} color={theme.colors.orange_500} />
        <Text style={styles.warningBoxText}>
          A leitura automática pode ter variações. Revise os campos antes de
          confirmar.
        </Text>
      </View>

      {imagemUri ? (
        <SurfaceCard style={styles.previewCard}>
          <Image source={{ uri: imagemUri }} style={styles.previewImage} />
          <Text style={styles.previewMeta}>
            Confiança da leitura: {confiancaLeitura.toFixed(1)}%
          </Text>
          <TouchableOpacity style={styles.recropButton} onPress={onRetake}>
            <Ionicons
              name="scan-outline"
              size={16}
              color={theme.colors.primary}
              style={styles.iconMarginRightSm}
            />
            <Text style={styles.recropButtonText}>
              Trocar foto e recortar novamente
            </Text>
          </TouchableOpacity>
        </SurfaceCard>
      ) : null}

      <Text style={styles.formTitle}>Dados Extraídos</Text>

      <SurfaceCard style={styles.formSectionBox}>
        <Text style={styles.sectionLabel}>Parâmetros Básicos</Text>

        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>pH (H2O)</Text>
            <TextInput
              style={styles.input}
              value={ph}
              onChangeText={setPh}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>M.O. (%)</Text>
            <TextInput
              style={styles.input}
              value={materiaOrganica}
              onChangeText={setMateriaOrganica}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>CTC (cmolc/dm3)</Text>
            <TextInput
              style={styles.input}
              value={ctc}
              onChangeText={setCtc}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>V (%)</Text>
            <TextInput
              style={styles.input}
              value={vBase}
              onChangeText={setVBase}
              keyboardType="numeric"
            />
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.formSectionBox}>
        <Text style={styles.sectionLabel}>Macronutrientes</Text>

        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Fósforo - P</Text>
            <TextInput
              style={styles.input}
              value={fosforo}
              onChangeText={setFosforo}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Potássio - K</Text>
            <TextInput
              style={styles.input}
              value={potassio}
              onChangeText={setPotassio}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Cálcio - Ca</Text>
            <TextInput
              style={styles.input}
              value={calcio}
              onChangeText={setCalcio}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Magnésio - Mg</Text>
            <TextInput
              style={styles.input}
              value={magnesio}
              onChangeText={setMagnesio}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Alumínio - Al</Text>
          <TextInput
            style={styles.input}
            value={aluminio}
            onChangeText={setAluminio}
            keyboardType="numeric"
          />
        </View>
      </SurfaceCard>

      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Ionicons
          name="checkmark-circle-outline"
          size={24}
          color={theme.colors.white}
          style={styles.iconMarginRightSm}
        />
        <Text style={styles.confirmButtonText}>
          Confirmar e Gerar Diagnóstico
        </Text>
      </TouchableOpacity>
    </View>
  );
}
