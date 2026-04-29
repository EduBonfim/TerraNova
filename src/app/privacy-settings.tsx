/**
 * Privacy Settings Screen
 * Permite ao usuário controlar configurações de privacidade, como bloqueio de mensagens
 */
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { setBlockMessages } from "@/services/authStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [blockMessages, setBlockMessagesState] = useState(
    user?.blockMessages ?? false,
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleBlockMessagesChange = async (value: boolean) => {
    setBlockMessagesState(value);
    setIsSaving(true);

    try {
      const updated = await setBlockMessages(user!.username, value);
      if (updated) {
        await refreshUser();
        Alert.alert(
          "Sucesso",
          value
            ? "Você não receberá mais mensagens de outros usuários."
            : "Você voltará a receber mensagens de outros usuários.",
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
      setBlockMessagesState(!value); // Revert on error
      Alert.alert(
        "Erro",
        "Não foi possível atualizar a configuração. Tente novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Configurações de Privacidade"
        subtitle="Controle quem pode entrar em contato com você"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_300}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Block Messages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={theme.colors.primary}
              style={styles.sectionIcon}
            />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Bloquear Mensagens</Text>
              <Text style={styles.sectionDescription}>
                Impedir que outros usuários enviem mensagens diretas
              </Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>
                Desativar Mensagens Diretas
              </Text>
              <Text style={styles.settingDescription}>
                {blockMessages
                  ? "Ninguém pode te enviar mensagens"
                  : "Qualquer usuário pode te enviar mensagens"}
              </Text>
            </View>
            <Switch
              value={blockMessages}
              onValueChange={handleBlockMessagesChange}
              disabled={isSaving}
              trackColor={{
                false: theme.colors.gray_300,
                true: theme.colors.orange_500,
              }}
              thumbColor={
                blockMessages ? theme.colors.orange_500 : theme.colors.gray_400
              }
            />
          </View>

          {blockMessages && (
            <View style={styles.warningBox}>
              <Ionicons
                name="information-circle"
                size={18}
                color={theme.colors.orange_500}
                style={styles.warningIcon}
              />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Mensagens Bloqueadas</Text>
                <Text style={styles.warningText}>
                  Pessoas que tentarem te mandar mensagem receberão uma
                  notificação de que você não está recebendo mensagens.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Como funciona:</Text>
          <View style={styles.infoItem}>
            <View
              style={[
                styles.infoDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Ativo:</Text> Você não receberá
              novas mensagens
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View
              style={[
                styles.infoDot,
                { backgroundColor: theme.colors.gray_400 },
              ]}
            />
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Inativo:</Text> Você receberá
              mensagens normalmente
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View
              style={[
                styles.infoDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Histórico:</Text> Conversas
              anteriores continuam acessíveis
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.gray_900,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: theme.colors.gray_500,
    lineHeight: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    paddingHorizontal: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.gray_900,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: theme.colors.gray_500,
    lineHeight: 14,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFFBF5",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.orange_500,
  },
  warningIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.orange_500,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 11,
    color: theme.colors.gray_600,
    lineHeight: 15,
  },
  infoSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_900,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.gray_600,
    lineHeight: 16,
    flex: 1,
  },
  infoBold: {
    fontWeight: "600",
    color: theme.colors.gray_900,
  },
  spacer: {
    height: 20,
  },
});
