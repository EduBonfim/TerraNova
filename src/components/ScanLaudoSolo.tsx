// my-app/src/components/ScanLaudoSolo.tsx
// Componente para capturar e processar laudo de solo com OCR

import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { SurfaceCard } from "./SurfaceCard";
import {
  extrairTextoDoLaudo,
  AnaliseSoloExtraida,
  formularDadosPraAPI,
} from "../services/ocrService";

interface ScanLaudoSoloProps {
  onAnaliseCompleta?: (analise: AnaliseSoloExtraida) => void;
  onSalvarNoBackend?: (dados: any) => Promise<void>;
}

const theme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    orange_500: "#F9A825",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_300: "#D1D5DB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    gray_900: "#111827",
    success: "#10B981",
    warning: "#FBBF24",
    danger: "#F87171",
  },
};

export function ScanLaudoSolo({
  onAnaliseCompleta,
  onSalvarNoBackend,
}: ScanLaudoSoloProps) {
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [analiseAtual, setAnaliseAtual] = useState<AnaliseSoloExtraida | null>(
    null
  );
  const [carregando, setCarregando] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);

  // Solicitar permissões
  const solicitarPermissoes = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissão Negada",
        "Precisamos de acesso à câmera e galeria para escanear o laudo."
      );
      return false;
    }

    return true;
  };

  // Capturar foto da câmera
  const capturarFotoCamara = async () => {
    const temPermissao = await solicitarPermissoes();
    if (!temPermissao) return;

    try {
      const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets[0]) {
        processarImagem(resultado.assets[0].uri);
      }
    } catch (erro) {
      console.error("Erro ao capturar foto:", erro);
      Alert.alert("Erro", "Não foi possível capturar a foto");
    }
  };

  // Selecionar da galeria
  const selecionarDaGaleria = async () => {
    const temPermissao = await solicitarPermissoes();
    if (!temPermissao) return;

    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets[0]) {
        processarImagem(resultado.assets[0].uri);
      }
    } catch (erro) {
      console.error("Erro ao selecionar imagem:", erro);
      Alert.alert("Erro", "Não foi possível selecionar a imagem");
    }
  };

  // Processar imagem com OCR
  const processarImagem = async (uri: string) => {
    setImagemUri(uri);
    setCarregando(true);
    setModalVisivel(true);

    try {
      console.log("📸 Iniciando análise de imagem...");
      const resultado = await extrairTextoDoLaudo(uri);

      console.log("✅ Análise concluída:", resultado);
      setAnaliseAtual(resultado);

      if (onAnaliseCompleta) {
        onAnaliseCompleta(resultado);
      }
    } catch (erro) {
      console.error("❌ Erro na análise:", erro);
      Alert.alert(
        "Erro na Análise",
        "Não foi possível processar a imagem. Tente novamente."
      );
      setAnaliseAtual(null);
    } finally {
      setCarregando(false);
    }
  };

  // Salvar no backend
  const salvarNoBackend = async () => {
    if (!analiseAtual || !onSalvarNoBackend) return;

    try {
      const dados = formularDadosPraAPI(analiseAtual);
      await onSalvarNoBackend(dados);
      Alert.alert("Sucesso", "Análise de solo salva com sucesso!");
      limpar();
    } catch (erro) {
      Alert.alert("Erro", "Erro ao salvar análise no backend");
    }
  };

  const limpar = () => {
    setImagemUri(null);
    setAnaliseAtual(null);
    setModalVisivel(false);
  };

  return (
    <View style={styles.container}>
      {/* Botões de Captura */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[styles.botao, styles.botaoPrimario]}
          onPress={capturarFotoCamara}
        >
          <Ionicons name="camera" size={24} color={theme.colors.white} />
          <Text style={styles.botaoTexto}>Tirar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.botaoSecundario]}
          onPress={selecionarDaGaleria}
        >
          <Ionicons name="images" size={24} color={theme.colors.primary} />
          <Text style={styles.botaoTextoSecundario}>Galeria</Text>
        </TouchableOpacity>
      </View>

      {/* Modal com Resultado */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Análise de Solo</Text>
              <TouchableOpacity onPress={limpar}>
                <Ionicons
                  name="close"
                  size={28}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent}>
              {carregando ? (
                <View style={styles.carregandoContainer}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                  <Text style={styles.carregandoTexto}>
                    🔄 Processando laudo...
                  </Text>
                  <Text style={styles.carregandoSubTexto}>
                    Extractando dados com Tesseract OCR
                  </Text>
                </View>
              ) : imagemUri && analiseAtual ? (
                <View>
                  {/* Imagem */}
                  <SurfaceCard style={styles.imagemCard}>
                    <Image
                      source={{ uri: imagemUri }}
                      style={styles.imagem}
                    />
                    <Text style={styles.confiancaTexto}>
                      Confiança de leitura: {analiseAtual.confianca_extracao.toFixed(1)}%
                    </Text>
                  </SurfaceCard>

                  {/* Nutrientes Extraídos */}
                  <SurfaceCard style={styles.card}>
                    <Text style={styles.cardTitulo}>📊 Nutrientes</Text>

                    <View style={styles.nutrienteRow}>
                      <View style={styles.nutriente}>
                        <Text style={styles.nutrienteSigla}>N</Text>
                        <Text style={styles.nutrienteValor}>
                          {analiseAtual.nutrientes.nitrogenio ||
                            "Não detectado"}
                        </Text>
                        <Text style={styles.nutrienteLabel}>Nitrogênio</Text>
                      </View>

                      <View style={styles.nutriente}>
                        <Text style={styles.nutrienteSigla}>P</Text>
                        <Text style={styles.nutrienteValor}>
                          {analiseAtual.nutrientes.fosforo ||
                            "Não detectado"}
                        </Text>
                        <Text style={styles.nutrienteLabel}>Fósforo</Text>
                      </View>

                      <View style={styles.nutriente}>
                        <Text style={styles.nutrienteSigla}>K</Text>
                        <Text style={styles.nutrienteValor}>
                          {analiseAtual.nutrientes.potassio ||
                            "Não detectado"}
                        </Text>
                        <Text style={styles.nutrienteLabel}>Potássio</Text>
                      </View>
                    </View>

                    {analiseAtual.materia_organica && (
                      <View style={styles.outrosParametros}>
                        <Text style={styles.parametroTexto}>
                          🌱 Matéria Orgânica: {analiseAtual.materia_organica}%
                        </Text>
                      </View>
                    )}

                    {analiseAtual.ph && (
                      <View style={styles.outrosParametros}>
                        <Text style={styles.parametroTexto}>
                          ⚗️ pH do Solo: {analiseAtual.ph}
                        </Text>
                      </View>
                    )}
                  </SurfaceCard>

                  {/* Carências */}
                  {analiseAtual.carencias_identificadas.length > 0 && (
                    <SurfaceCard style={[styles.card, styles.carenciasCard]}>
                      <Text style={styles.cardTitulo}>⚠️ Carências Identificadas</Text>
                      {analiseAtual.carencias_identificadas.map(
                        (carencia, idx) => (
                          <View key={idx} style={styles.carenciaItem}>
                            <Ionicons
                              name="alert-circle"
                              size={20}
                              color={theme.colors.warning}
                            />
                            <Text style={styles.carenciaTexto}>{carencia}</Text>
                          </View>
                        )
                      )}
                    </SurfaceCard>
                  )}

                  {/* Texto Bruto (para verificação) */}
                  <SurfaceCard style={styles.card}>
                    <Text style={styles.cardTitulo}>📝 Texto Extraído</Text>
                    <Text style={styles.textoExtraido}>
                      {analiseAtual.texto_bruto.slice(0, 200)}...
                    </Text>
                    <Text style={styles.textoExtraidoHint}>
                      (Primeiros 200 caracteres)
                    </Text>
                  </SurfaceCard>
                </View>
              ) : null}
            </ScrollView>

            {/* Botões de Ação */}
            <View style={styles.acoes}>
              <TouchableOpacity
                style={[styles.botaoAcao, styles.botaoCancelar]}
                onPress={limpar}
              >
                <Text style={styles.botaoAcaoTexto}>Cancelar</Text>
              </TouchableOpacity>

              {analiseAtual && (
                <>
                  <TouchableOpacity
                    style={[styles.botaoAcao, styles.botaoSecundarioAcao]}
                    onPress={() => {
                      // Copiar dados para edição manual
                      Alert.alert(
                        "Editar",
                        "Funcionalidade de edição manual em desenvolvimento"
                      );
                    }}
                  >
                    <Text style={styles.botaoAcaoTextoSecundario}>Editar</Text>
                  </TouchableOpacity>

                  {onSalvarNoBackend && (
                    <TouchableOpacity
                      style={[styles.botaoAcao, styles.botaoSalvar]}
                      onPress={salvarNoBackend}
                    >
                      <Text style={styles.botaoAcaoTexto}>Salvar</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  botoesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  botao: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  botaoPrimario: {
    backgroundColor: theme.colors.primary,
  },
  botaoSecundario: {
    backgroundColor: theme.colors.lightGreen,
  },
  botaoTexto: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  botaoTextoSecundario: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  carregandoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  carregandoTexto: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    color: theme.colors.gray_800,
  },
  carregandoSubTexto: {
    fontSize: 14,
    color: theme.colors.gray_500,
    marginTop: 8,
  },
  imagemCard: {
    marginBottom: 16,
    overflow: "hidden",
  },
  imagem: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  confiancaTexto: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
  },
  carenciasCard: {
    backgroundColor: "#FFF3CD",
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: theme.colors.gray_800,
  },
  nutrienteRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  nutriente: {
    alignItems: "center",
    padding: 12,
    backgroundColor: theme.colors.lightGreen,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  nutrienteSigla: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  nutrienteValor: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    color: theme.colors.gray_800,
  },
  nutrienteLabel: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 4,
  },
  outrosParametros: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.gray_200,
    borderRadius: 8,
    marginVertical: 6,
  },
  parametroTexto: {
    fontSize: 14,
    color: theme.colors.gray_800,
  },
  carenciaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  carenciaTexto: {
    fontSize: 14,
    marginLeft: 12,
    color: theme.colors.gray_800,
    flex: 1,
  },
  textoExtraido: {
    fontSize: 13,
    color: theme.colors.gray_800,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  textoExtraidoHint: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 8,
    marginLeft: 12,
  },
  acoes: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
  },
  botaoAcao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoCancelar: {
    backgroundColor: theme.colors.gray_200,
  },
  botaoSecundarioAcao: {
    backgroundColor: theme.colors.gray_200,
  },
  botaoSalvar: {
    backgroundColor: theme.colors.success,
  },
  botaoAcaoTexto: {
    fontWeight: "600",
    fontSize: 14,
    color: theme.colors.white,
  },
  botaoAcaoTextoSecundario: {
    fontWeight: "600",
    fontSize: 14,
    color: theme.colors.primary,
  },
});
