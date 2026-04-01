import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "../components/AppHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { extrairTextoDoLaudo } from "../services/ocrService";
import { useAuth } from "../contexts/AuthContext";
import { findDuplicateSoilReport, saveSoilReport, type SoilReport } from "../services/soilReportsStore";

// 🎨 TEMA OFICIAL TERRA NOVA
const theme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_300: "#D1D5DB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    orange_500: "#F9A825",
    red_500: "#EF4444",
  },
};

const IOS_VISUAL = {
  keyboardBehavior: "padding" as const,
};

const ANDROID_VISUAL = {
  keyboardBehavior: undefined,
};

const CURRENT_KEYBOARD_BEHAVIOR =
  Platform.OS === "ios" ? IOS_VISUAL.keyboardBehavior : ANDROID_VISUAL.keyboardBehavior;

export default function ScanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [etapa, setEtapa] = useState<0 | 1 | 2 | 3>(0);
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [confiancaLeitura, setConfiancaLeitura] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [duplicateReport, setDuplicateReport] = useState<SoilReport | null>(null);

  const [ph, setPh] = useState("5.2");
  const [materiaOrganica, setMateriaOrganica] = useState("1.5");
  const [fosforo, setFosforo] = useState("12.0");
  const [potassio, setPotassio] = useState("45.0");
  const [calcio, setCalcio] = useState("1.5");
  const [magnesio, setMagnesio] = useState("0.8");
  const [aluminio, setAluminio] = useState("0.3");
  const [ctc, setCtc] = useState("6.2");
  const [vBase, setVBase] = useState("45.0");
  const [carencias, setCarencias] = useState<string[]>([]);

  const solicitarPermissoes = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || galleryStatus !== "granted") {
      Alert.alert("Permissão negada", "Precisamos da câmera e galeria para ler o laudo.");
      return false;
    }

    return true;
  };

  const toNumber = (value: string) => {
    const parsed = parseFloat((value || "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const atualizarDiagnostico = () => {
    const lista: string[] = [];
    if (toNumber(fosforo) < 10) lista.push("Deficiência de Fósforo (P)");
    if (toNumber(materiaOrganica) < 2) lista.push("Baixa Matéria Orgânica");
    if (toNumber(ph) < 6) lista.push("Solo ácido (pH baixo)");
    if (lista.length === 0) lista.push("Solo dentro dos padrões para manutenção");
    setCarencias(lista);
  };

  const processarImagem = async (uri: string) => {
    setImagemUri(uri);
    setEtapa(1);

    try {
      const analise = await extrairTextoDoLaudo(uri);
      setConfiancaLeitura(analise.confianca_extracao || 0);
      if (analise.ph) setPh(analise.ph);
      if (analise.materia_organica) setMateriaOrganica(analise.materia_organica);
      if (analise.nutrientes.fosforo) setFosforo(analise.nutrientes.fosforo);
      if (analise.nutrientes.potassio) setPotassio(analise.nutrientes.potassio);
      setCarencias(analise.carencias_identificadas || []);
    } catch (error) {
      Alert.alert("Leitura parcial", "Não foi possível ler tudo automaticamente. Revise os campos manualmente.");
      console.error(error);
    } finally {
      setEtapa(2);
    }
  };

  const capturarLaudo = async () => {
    const permitido = await solicitarPermissoes();
    if (!permitido) return;

    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!resultado.canceled && resultado.assets?.[0]?.uri) {
      processarImagem(resultado.assets[0].uri);
    }
  };

  const selecionarArquivo = async () => {
    const permitido = await solicitarPermissoes();
    if (!permitido) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
      mediaTypes: ["images"],
    });

    if (!resultado.canceled && resultado.assets?.[0]?.uri) {
      processarImagem(resultado.assets[0].uri);
    }
  };

  const confirmarDados = () => {
    atualizarDiagnostico();
    setSavedReportId(null);
    setEtapa(3);
  };

  const verificarDuplicidade = async (diagnosticoAtual: string[]) => {
    const duplicate = await findDuplicateSoilReport({
      ownerUsername: user?.username ?? "anonimo",
      diagnosis: diagnosticoAtual,
      metrics: {
        ph,
        materiaOrganica,
        fosforo,
        potassio,
        calcio,
        magnesio,
        aluminio,
        ctc,
        vBase,
      },
    });
    setDuplicateReport(duplicate);
    if (duplicate) {
      setSavedReportId(duplicate.id);
    }
  };

  const confirmarDadosComVerificacao = async () => {
    const lista: string[] = [];
    if (toNumber(fosforo) < 10) lista.push("Deficiência de Fósforo (P)");
    if (toNumber(materiaOrganica) < 2) lista.push("Baixa Matéria Orgânica");
    if (toNumber(ph) < 6) lista.push("Solo ácido (pH baixo)");
    if (lista.length === 0) lista.push("Solo dentro dos padrões para manutenção");

    setCarencias(lista);
    setSavedReportId(null);
    setDuplicateReport(null);
    await verificarDuplicidade(lista);
    setEtapa(3);
  };

  const salvarAnaliseLocal = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      if (duplicateReport) {
        Alert.alert("Laudo já existe", "Essa análise já está salva em Meus Laudos de Solo.");
        return;
      }

      const report = await saveSoilReport({
        ownerUsername: user?.username ?? "anonimo",
        imageUri: imagemUri ?? undefined,
        confidence: confiancaLeitura,
        diagnosis: carencias,
        metrics: {
          ph,
          materiaOrganica,
          fosforo,
          potassio,
          calcio,
          magnesio,
          aluminio,
          ctc,
          vBase,
        },
      });

      setSavedReportId(report.id);
      Alert.alert("Laudo salvo", "Sua análise foi salva em Meus Laudos de Solo.");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar o laudo no momento.");
    } finally {
      setIsSaving(false);
    }
  };

  const salvarEIrParaMapa = async () => {
    if (!savedReportId && !duplicateReport) {
      await salvarAnaliseLocal();
    }
    router.push("/map");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Análise Inteligente"
        onBackPress={() => router.replace("/home")}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
        titleAlign="center"
        rightAccessory={<View style={styles.headerRightSpacer} />}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={CURRENT_KEYBOARD_BEHAVIOR}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {etapa === 0 && (
            <View style={styles.centerContent}>
              <Ionicons name="document-text" size={80} color={theme.colors.gray_300} style={styles.iconMain} />
              <Text style={styles.title}>Envie o seu Laudo</Text>
              <Text style={styles.subtitle}>
                Tire uma foto ou envie o arquivo do seu laudo. Vamos extrair os dados automaticamente para você revisar.
              </Text>

              <TouchableOpacity style={styles.uploadButton} onPress={capturarLaudo}>
                <Ionicons name="camera-outline" size={24} color={theme.colors.white} style={styles.iconMarginRightLg} />
                <Text style={styles.uploadButtonText}>Tirar Foto do Laudo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={selecionarArquivo}>
                <Ionicons name="folder-open-outline" size={20} color={theme.colors.primary} style={styles.iconMarginRightLg} />
                <Text style={styles.secondaryButtonText}>Escolher Arquivo</Text>
              </TouchableOpacity>
            </View>
          )}

          {etapa === 1 && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loadingIndicator} />
              <Text style={styles.title}>Analisando o laudo...</Text>
              <Text style={styles.subtitle}>Estamos lendo os parâmetros para pré-preencher os campos.</Text>
            </View>
          )}

          {etapa === 2 && (
            <View style={styles.formContent}>
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={24} color={theme.colors.orange_500} />
                <Text style={styles.warningBoxText}>
                  A leitura automática pode ter variações. Revise os campos antes de confirmar.
                </Text>
              </View>

              {imagemUri ? (
                <SurfaceCard style={styles.previewCard}>
                  <Image source={{ uri: imagemUri }} style={styles.previewImage} />
                  <Text style={styles.previewMeta}>Confiança da leitura: {confiancaLeitura.toFixed(1)}%</Text>
                </SurfaceCard>
              ) : null}

              <Text style={styles.formTitle}>Dados Extraídos</Text>

              <SurfaceCard style={styles.formSectionBox}>
                <Text style={styles.sectionLabel}>Parâmetros Básicos</Text>

                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>pH (H2O)</Text>
                    <TextInput style={styles.input} value={ph} onChangeText={setPh} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>M.O. (%)</Text>
                    <TextInput style={styles.input} value={materiaOrganica} onChangeText={setMateriaOrganica} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>CTC (cmolc/dm3)</Text>
                    <TextInput style={styles.input} value={ctc} onChangeText={setCtc} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>V (%)</Text>
                    <TextInput style={styles.input} value={vBase} onChangeText={setVBase} keyboardType="numeric" />
                  </View>
                </View>
              </SurfaceCard>

              <SurfaceCard style={styles.formSectionBox}>
                <Text style={styles.sectionLabel}>Macronutrientes</Text>

                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Fósforo - P</Text>
                    <TextInput style={styles.input} value={fosforo} onChangeText={setFosforo} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Potássio - K</Text>
                    <TextInput style={styles.input} value={potassio} onChangeText={setPotassio} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Cálcio - Ca</Text>
                    <TextInput style={styles.input} value={calcio} onChangeText={setCalcio} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Magnésio - Mg</Text>
                    <TextInput style={styles.input} value={magnesio} onChangeText={setMagnesio} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Alumínio - Al</Text>
                  <TextInput style={styles.input} value={aluminio} onChangeText={setAluminio} keyboardType="numeric" />
                </View>
              </SurfaceCard>

              <TouchableOpacity style={styles.confirmButton} onPress={confirmarDadosComVerificacao}>
                <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.white} style={styles.iconMarginRightSm} />
                <Text style={styles.confirmButtonText}>Confirmar e Gerar Diagnóstico</Text>
              </TouchableOpacity>
            </View>
          )}

          {etapa === 3 && (
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

              <TouchableOpacity style={styles.matchButton} onPress={salvarEIrParaMapa}>
                <Ionicons name="map-outline" size={20} color={theme.colors.white} style={styles.iconMarginRightSm} />
                <Text style={styles.matchButtonText}>Salvar e Buscar Insumos no Mapa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveOnlyButton, isSaving ? styles.saveOnlyButtonDisabled : null]}
                disabled={isSaving || !!duplicateReport}
                onPress={salvarAnaliseLocal}
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

              <TouchableOpacity style={styles.viewReportsButton} onPress={() => router.push("/soil-reports")}>
                <Text style={styles.viewReportsButtonText}>Ver Meus Laudos de Solo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.restartButton} onPress={() => setEtapa(0)}>
                <Text style={styles.restartButtonText}>Analisar novo laudo</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 💅 ESTILOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  headerRightSpacer: { width: 40 },
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1 },
  centerContent: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  formContent: { flex: 1, padding: 16 },
  iconMain: { marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.gray_500,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  iconMarginRightLg: { marginRight: 10 },
  iconMarginRightSm: { marginRight: 8 },
  loadingIndicator: { transform: [{ scale: 1.5 }], marginBottom: 24 },
  uploadButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  uploadButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.lightGreen,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.orange_500,
  },
  warningBoxText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#B45309",
    lineHeight: 20,
    fontWeight: "500",
  },
  previewCard: { marginBottom: 14, padding: 10 },
  previewImage: { width: "100%", height: 160, borderRadius: 10, marginBottom: 8 },
  previewMeta: { fontSize: 12, color: theme.colors.gray_500, textAlign: "center" },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 16,
  },
  formSectionBox: { padding: 16, marginBottom: 16 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  inputCol: { width: "48%" },
  inputGroup: { marginBottom: 12 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.gray_500,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.gray_800,
  },
  confirmButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    elevation: 2,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  resultCard: {
    width: "100%",
    padding: 20,
    marginBottom: 20,
  },
  resultCardTitle: {
    fontSize: 14,
    color: theme.colors.gray_500,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 16,
  },
  resultItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  duplicateBadge: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  duplicateBadgeText: {
    marginLeft: 6,
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  resultText: { fontSize: 16, color: theme.colors.gray_800, marginLeft: 12, flex: 1 },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray_200,
    marginVertical: 16,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 15,
    color: theme.colors.gray_800,
    lineHeight: 22,
  },
  matchButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.orange_500,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  matchButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  restartButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  restartButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  saveOnlyButton: {
    marginTop: 10,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.lightGreen,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveOnlyButtonDisabled: {
    opacity: 0.7,
  },
  saveOnlyButtonText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  viewReportsButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewReportsButtonText: {
    color: theme.colors.gray_500,
    fontWeight: "600",
  },
});
