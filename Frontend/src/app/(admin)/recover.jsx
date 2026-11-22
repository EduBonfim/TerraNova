import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { getDeletedUsers, recoverUserAccount } from "@/services/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appTheme as theme } from "../../theme/appTheme";

export default function RecoverAccountsScreen() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getDeletedUsers();
      setUsers(data);
    } catch (_e) {
      Alert.alert("Erro", "Falha ao buscar usuários deletados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecover = (user) => {
    Alert.alert(
      "Recuperar Conta",
      `Tem certeza que deseja recuperar a conta de ${
        user.fullName || user.username
      }? Todos os produtos e histórico voltarão a aparecer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recuperar",
          style: "default",
          onPress: async () => {
            setIsProcessing(user.id);
            try {
              const success = await recoverUserAccount(user.id);
              if (success) {
                Alert.alert("Sucesso", "Conta recuperada com sucesso!");
                loadData();
              } else {
                Alert.alert("Erro", "Não foi possível recuperar a conta.");
              }
            } catch (_e) {
              Alert.alert("Erro", "Erro ao recuperar conta.");
            } finally {
              setIsProcessing(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader
        title="Lixeira de Contas"
        onBackPress={() => router.back()}
        showBackButton={true}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Ionicons name="trash-outline" size={32} color="#EF4444" />
          <Text style={styles.title}>Contas Deletadas Recentemente</Text>
          <Text style={styles.subtitle}>
            Estas contas foram apagadas e ainda estão no período de
            arrependimento (30 dias). Você pode recuperá-las abaixo.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : users.length === 0 ? (
          <SurfaceCard style={styles.emptyCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={48}
              color={theme.colors.primary}
            />
            <Text style={styles.emptyText}>
              Nenhuma conta na lixeira no momento.
            </Text>
          </SurfaceCard>
        ) : (
          users.map((user) => (
            <SurfaceCard key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user.fullName || user.username}
                </Text>
                <Text style={styles.userDetail}>
                  {user.email
                    ? user.email.replace(/_del_.*$/, "")
                    : user.cpf
                    ? `CPF: ${user.cpf.replace(
                        /(\d{3})(\d{3})(\d{3})(\d{2})/,
                        "$1.$2.$3-$4"
                      )}`
                    : "Sem e-mail cadastrado"}
                </Text>
                <Text style={styles.userRole}>
                  Perfil: {user.role === "producer" ? "Produtor" : "Comprador"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.recoverButton}
                onPress={() => handleRecover(user)}
                disabled={isProcessing === user.id}
              >
                {isProcessing === user.id ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={18} color="white" />
                    <Text style={styles.recoverText}>Restaurar</Text>
                  </>
                )}
              </TouchableOpacity>
            </SurfaceCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { padding: 20 },
  header: { alignItems: "center", marginBottom: 24, paddingHorizontal: 10 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
  emptyCard: { alignItems: "center", padding: 32 },
  emptyText: { fontSize: 16, color: "#64748B", marginTop: 12 },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    padding: 16,
  },
  userInfo: { flex: 1, marginRight: 12 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  userDetail: { fontSize: 12, color: "#64748B", marginTop: 2 },
  userRole: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "600",
    marginTop: 4,
  },
  recoverButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  recoverText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 14,
  },
});
