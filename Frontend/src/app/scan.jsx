import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { extrairTextoDoLaudo } from "@/services/ocrService";
import {
  findDuplicateSoilReport,
  saveSoilReport,
} from "@/services/soilReportsStore";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appTheme as theme } from "@/theme/appTheme";

import { scanStyles as styles } from "@/features/scan/styles/scan.styles";
import { ScanOptionsView } from "@/features/scan/components/ScanOptionsView";
import { ScanningFeedbackView } from "@/features/scan/components/ScanningFeedbackView";
import { ExtractedDataForm } from "@/features/scan/components/ExtractedDataForm";
import { DiagnosisResultView } from "@/features/scan/components/DiagnosisResultView";

const CURRENT_KEYBOARD_BEHAVIOR = Platform.OS === "ios" ? "padding" : undefined;
const A4_ASPECT = [210, 297];

export default function ScanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [etapa, setEtapa] = useState(0);
  const [imagemUri, setImagemUri] = useState(null);
  const [confiancaLeitura, setConfiancaLeitura] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedReportId, setSavedReportId] = useState(null);
  const [duplicateReport, setDuplicateReport] = useState(null);

  const [ph, setPh] = useState("");
  const [materiaOrganica, setMateriaOrganica] = useState("");
  const [fosforo, setFosforo] = useState("");
  const [potassio, setPotassio] = useState("");
  const [calcio, setCalcio] = useState("");
  const [magnesio, setMagnesio] = useState("");
  const [aluminio, setAluminio] = useState("");
  const [ctc, setCtc] = useState("");
  const [vBase, setVBase] = useState("");
  const [carencias, setCarencias] = useState([]);

  const solicitarPermissoes = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || galleryStatus !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Precisamos da câmera e galeria para ler o laudo."
      );
      return false;
    }

    return true;
  };

  const toNumber = (value) => {
    const parsed = parseFloat((value || "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const hasValue = (value) => value.trim().length > 0;

  const processarImagem = async (uri) => {
    setImagemUri(uri);
    setEtapa(1);

    try {
      const analise = await extrairTextoDoLaudo(uri);
      setConfiancaLeitura(analise.confianca_extracao || 0);
      if (analise.ph) setPh(analise.ph);
      if (analise.materia_organica)
        setMateriaOrganica(analise.materia_organica);
      if (analise.nutrientes.fosforo) setFosforo(analise.nutrientes.fosforo);
      if (analise.nutrientes.potassio) setPotassio(analise.nutrientes.potassio);
      setCarencias(analise.carencias_identificadas || []);

      const extraiuAlgumDado = Boolean(
        analise.ph ||
          analise.materia_organica ||
          analise.nutrientes.nitrogenio ||
          analise.nutrientes.fosforo ||
          analise.nutrientes.potassio
      );

      if (!extraiuAlgumDado) {
        Alert.alert(
          "Leitura sem dados detectados",
          "Não encontramos valores no laudo. Tente recortar melhor a área do documento e revisar manualmente."
        );
      }
    } catch (error) {
      Alert.alert(
        "Leitura parcial",
        "Não foi possível ler tudo automaticamente. Revise os campos manualmente."
      );
      console.error(error);
    } finally {
      setEtapa(2);
    }
  };

  const capturarLaudo = async () => {
    const permitido = await solicitarPermissoes();
    if (!permitido) return;

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      aspect: A4_ASPECT,
    });

    if (!resultado.canceled && resultado.assets?.[0]?.uri) {
      processarImagem(resultado.assets[0].uri);
    }
  };

  const selecionarArquivo = async () => {
    const permitido = await solicitarPermissoes();
    if (!permitido) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      aspect: A4_ASPECT,
    });

    if (!resultado.canceled && resultado.assets?.[0]?.uri) {
      processarImagem(resultado.assets[0].uri);
    }
  };

  const verificarDuplicidade = async (diagnosticoAtual) => {
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
    const lista = [];
    if (hasValue(fosforo) && toNumber(fosforo) < 10)
      lista.push("Deficiência de Fósforo (P)");
    if (hasValue(materiaOrganica) && toNumber(materiaOrganica) < 2)
      lista.push("Baixa Matéria Orgânica");
    if (hasValue(ph) && toNumber(ph) < 6) lista.push("Solo ácido (pH baixo)");
    if (lista.length === 0)
      lista.push("Solo dentro dos padrões para manutenção");

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
        Alert.alert(
          "Laudo já existe",
          "Essa análise já está salva em Meus Laudos de Solo."
        );
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
      Alert.alert(
        "Laudo salvo",
        "Sua análise foi salva em Meus Laudos de Solo."
      );
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
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Análise Inteligente"
        onBackPress={() => router.back()}
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {etapa === 0 && (
            <ScanOptionsView
              onCapture={capturarLaudo}
              onSelectFile={selecionarArquivo}
            />
          )}

          {etapa === 1 && <ScanningFeedbackView />}

          {etapa === 2 && (
            <ExtractedDataForm
              imagemUri={imagemUri}
              confiancaLeitura={confiancaLeitura}
              onRetake={selecionarArquivo}
              ph={ph}
              setPh={setPh}
              materiaOrganica={materiaOrganica}
              setMateriaOrganica={setMateriaOrganica}
              ctc={ctc}
              setCtc={setCtc}
              vBase={vBase}
              setVBase={setVBase}
              fosforo={fosforo}
              setFosforo={setFosforo}
              potassio={potassio}
              setPotassio={setPotassio}
              calcio={calcio}
              setCalcio={setCalcio}
              magnesio={magnesio}
              setMagnesio={setMagnesio}
              aluminio={aluminio}
              setAluminio={setAluminio}
              onConfirm={confirmarDadosComVerificacao}
            />
          )}

          {etapa === 3 && (
            <DiagnosisResultView
              carencias={carencias}
              duplicateReport={duplicateReport}
              isSaving={isSaving}
              savedReportId={savedReportId}
              onSaveAndGoToMap={salvarEIrParaMapa}
              onSaveOnly={salvarAnaliseLocal}
              onViewReports={() => router.push("/soil-reports")}
              onRestart={() => setEtapa(0)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
