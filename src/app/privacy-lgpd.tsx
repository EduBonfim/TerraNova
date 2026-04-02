import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppHeader } from "../components/AppHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { useAuth } from "../contexts/AuthContext";
import {
  acceptLgpdForUser,
  deleteUserAccount,
  exportUserPersonalData,
  LGPD_TERMS_VERSION,
  maskDocument,
  type UserPersonalDataExport,
} from "../services/authStore";

const theme = {
  colors: {
    primary: "#6B8E23",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    red_500: "#EF4444",
  },
};

export default function PrivacyLgpdScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ forceConsent?: string }>();
  const { user, logout, refreshUser } = useAuth();
  const [exportedData, setExportedData] = useState<UserPersonalDataExport | null>(null);

  const mustAccept = params.forceConsent === "1" || Boolean(user?.pendingLgpdReacceptance);

  const loadExport = useCallback(async () => {
    if (!user?.username) return;
    const data = await exportUserPersonalData(user.username);
    setExportedData(data);
  }, [user?.username]);

  const handleDeleteAccount = async () => {
    if (!user?.username) return;
    if ((user.role || "user") === "admin") {
      Alert.alert("Operacao bloqueada", "A conta admin padrao nao pode ser excluida no app.");
      return;
    }

    Alert.alert(
      "Excluir conta",
      "Essa acao remove seus dados de acesso locais neste dispositivo. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const removed = await deleteUserAccount(user.username);
            if (removed) {
              await logout();
              Alert.alert("Conta removida", "Seus dados locais de cadastro foram excluidos deste dispositivo.");
              router.replace("/login");
              return;
            }

            Alert.alert("Nao foi possivel excluir", "Conta nao encontrada para exclusao.");
          },
        },
      ],
    );
  };

  const handleAcceptLgpd = async () => {
    if (!user?.username) return;
    const updated = await acceptLgpdForUser(user.username);
    if (!updated) {
      Alert.alert("Falha", "Nao foi possivel registrar o aceite LGPD.");
      return;
    }

    await refreshUser();
    Alert.alert("Aceite registrado", "Consentimento LGPD atualizado com sucesso.");
    if (updated.role === "admin") {
      router.replace("/admin-panel");
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Privacidade e LGPD"
        subtitle={`Versao dos termos: ${LGPD_TERMS_VERSION}`}
        onBackPress={() => (mustAccept ? router.replace("/login") : router.back())}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {mustAccept ? (
          <SurfaceCard style={styles.requiredCard}>
            <Text style={styles.requiredTitle}>Aceite obrigatorio para continuar</Text>
            <Text style={styles.text}>
              Para seguir no painel administrativo, confirme o aceite dos termos de privacidade e tratamento de dados.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAcceptLgpd}>
              <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.white} style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Aceitar termos LGPD agora</Text>
            </TouchableOpacity>
          </SurfaceCard>
        ) : null}

        <SurfaceCard style={styles.card}>
          <Text style={styles.title}>Direitos do titular (LGPD)</Text>
          <Text style={styles.text}>Acesso e transparência sobre os dados cadastrados.</Text>
          <Text style={styles.text}>Correção de dados incompletos ou desatualizados.</Text>
          <Text style={styles.text}>Portabilidade em formato estruturado (exportação).</Text>
          <Text style={styles.text}>Solicitação de exclusão de dados locais de cadastro.</Text>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.title}>Segurança aplicada</Text>
          <Text style={styles.text}>Documentos são mascarados no painel administrativo.</Text>
          <Text style={styles.text}>Exibição mínima de dados sensíveis para função de moderação.</Text>
          <Text style={styles.text}>Consentimento registrado no cadastro com versão dos termos.</Text>
        </SurfaceCard>

        <TouchableOpacity style={styles.primaryButton} onPress={loadExport}>
          <Ionicons name="download-outline" size={18} color={theme.colors.white} style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Exportar meus dados</Text>
        </TouchableOpacity>

        {exportedData ? (
          <SurfaceCard style={styles.card}>
            <Text style={styles.title}>Pré-visualização da exportação</Text>
            <Text style={styles.dataLine}>Usuário: {exportedData.username}</Text>
            <Text style={styles.dataLine}>Nome: {exportedData.fullName || "Nao informado"}</Text>
            <Text style={styles.dataLine}>Propriedade: {exportedData.farmName || "Nao informado"}</Text>
            <Text style={styles.dataLine}>
              Documento: {exportedData.farmDocumentType ? exportedData.farmDocumentType.toUpperCase() : "DOC"} {" "}
              {maskDocument(exportedData.farmDocument, 4)}
            </Text>
            <Text style={styles.dataLine}>Aceite LGPD: {exportedData.lgpdAcceptedAt || "Nao registrado"}</Text>
          </SurfaceCard>
        ) : null}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.red_500} style={styles.buttonIcon} />
          <Text style={styles.deleteButtonText}>Excluir minha conta neste dispositivo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 24 },
  card: { padding: 16, marginBottom: 14 },
  requiredCard: {
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  requiredTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.gray_800,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "700", color: theme.colors.gray_800, marginBottom: 10 },
  text: { color: theme.colors.gray_500, lineHeight: 20, marginBottom: 6 },
  dataLine: { color: theme.colors.gray_800, marginBottom: 8 },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 14,
  },
  primaryButtonText: { color: theme.colors.white, fontWeight: "700", fontSize: 15 },
  deleteButton: {
    borderWidth: 1,
    borderColor: theme.colors.red_500,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: theme.colors.white,
  },
  deleteButtonText: { color: theme.colors.red_500, fontWeight: "700", fontSize: 15 },
  buttonIcon: { marginRight: 8 },
});
