import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "../components/AppHeader";
import { initAuthStore, registerUser } from "../services/authStore";

// 🎨 PALETA OFICIAL TERRA NOVA
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

export default function RegisterScreen() {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomePropriedade, setNomePropriedade] = useState("");
  const [usuarioLogin, setUsuarioLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      await initAuthStore();
      setIsAuthReady(true);
    };

    load();
  }, []);

  const concluirCadastro = async () => {
    if (!isAuthReady) {
      Alert.alert("Aguarde", "Carregando dados de acesso...");
      return;
    }

    const nome = nomeCompleto.trim();
    const usuario = usuarioLogin.trim();
    const senhaLimpa = senha.trim();

    if (!nome || !usuario || !senhaLimpa) {
      Alert.alert("Campos obrigatorios", "Preencha nome, login e senha.");
      return;
    }

    if (senhaLimpa.length < 4) {
      Alert.alert("Senha invalida", "A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    const result = await registerUser({
      username: usuario,
      password: senhaLimpa,
      fullName: nome,
      farmName: nomePropriedade,
    });

    if (!result.ok && result.reason === "exists") {
      Alert.alert("Usuario ja existe", "Use outro login para cadastrar.");
      return;
    }

    if (!result.ok) {
      Alert.alert("Cadastro invalido", "Verifique os dados e tente novamente.");
      return;
    }

    Alert.alert("Cadastro concluido", "Conta criada com sucesso. Faça login para entrar.", [
      { text: "OK", onPress: () => router.replace("/login") },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Nova Conta"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.white}
        textColor={theme.colors.gray_800}
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
          <Text style={styles.pageTitle}>Junte-se ao Terra Nova</Text>
          <Text style={styles.pageSubtitle}>
            Preencha os seus dados para aceder ao mapa e ao mercado
            agroecológico.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.colors.gray_500}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Pedro Paulo"
                  value={nomeCompleto}
                  onChangeText={setNomeCompleto}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Propriedade (Opcional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="home-outline"
                  size={20}
                  color={theme.colors.gray_500}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Sítio Esperança"
                  value={nomePropriedade}
                  onChangeText={setNomePropriedade}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail ou CPF</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.colors.gray_500}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Para o seu login"
                  value={usuarioLogin}
                  onChangeText={setUsuarioLogin}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Criar Senha</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.gray_500}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo de 4 caracteres"
                  secureTextEntry={true}
                  value={senha}
                  onChangeText={setSenha}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={concluirCadastro}
            >
              <Text style={styles.registerButtonText}>
                {isAuthReady ? "Concluir Cadastro" : "Carregando..."}
              </Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={theme.colors.white}
                style={styles.submitIconSpacing}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerRightSpacer: { width: 40 },

  scrollContent: { padding: 24, paddingBottom: 40 },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: theme.colors.gray_500,
    marginBottom: 32,
    lineHeight: 22,
  },

  form: { width: "100%" },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 56,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: theme.colors.gray_800 },

  registerButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.orange_500,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    elevation: 2,
  },
  registerButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  submitIconSpacing: { marginLeft: 8 },
});
