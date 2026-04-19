import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import {
    acceptLgpdForUser,
    deleteUserAccount,
    exportUserPersonalData,
    LGPD_TERMS_VERSION,
    maskDocument,
    maskEmail,
    maskPhone,
    type UserPersonalDataExport,
} from "@/services/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
    if (updated?.role === "admin") {
      router.replace("/(admin)/home");
      return;
    }
    if (updated?.role === "buyer") {
      router.replace("/(buyer)/home");
      return;
    }
    // role === "user" (produtor)
    router.replace("/(tabs)/home");
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
          <View style={styles.rightsContainer}>
            <Text style={styles.text}>• <Text style={styles.bold}>Acesso:</Text> Transparência total sobre seus dados.</Text>
            <Text style={styles.text}>• <Text style={styles.bold}>Correção:</Text> Ajuste de dados incompletos.</Text>
            <Text style={styles.text}>• <Text style={styles.bold}>Portabilidade:</Text> Leve seus dados (Exportação).</Text>
            <Text style={styles.text}>• <Text style={styles.bold}>Exclusão:</Text> Direito ao esquecimento local.</Text>
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.title}>Finalidade e Base Legal</Text>
          <Text style={styles.text}>
            Seus dados são utilizados para viabilizar a <Text style={styles.bold}>Rastreabilidade Vegetal (INC 02/2018)</Text>, 
            conectando sua produção ao mercado de forma segura e transparente.
          </Text>
          <Text style={[styles.text, { marginTop: 8 }]}>
            <Text style={styles.bold}>Base Legal:</Text> Execução de contrato e cumprimento de obrigação regulatória.
          </Text>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.title}>Segurança e DPO</Text>
          <Text style={styles.text}>Documentos mascarados e criptografia de ponta a ponta.</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Encarregado (DPO):</Text> dpo@terranova.com.br
          </Text>
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
            {exportedData.cpf && (
              <Text style={styles.dataLine}>
                CPF (Comprador): {maskDocument(exportedData.cpf, 4)}
              </Text>
            )}
            <Text style={styles.dataLine}>Email: {maskEmail(user?.email)}</Text>
            <Text style={styles.dataLine}>Telefone: {maskPhone(user?.phone)}</Text>
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
  bold: { fontWeight: "700", color: theme.colors.gray_800 },
  rightsContainer: { marginTop: 4 },
});
