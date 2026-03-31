import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { authenticateUser, initAuthStore } from "../services/authStore";

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
  keyboardBehavior: "height" as const,
};

const CURRENT_PLATFORM_UI = Platform.OS === "ios" ? IOS_VISUAL : ANDROID_VISUAL;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      await initAuthStore();
      setIsAuthReady(true);
    };

    load();
  }, []);

  const fazerLogin = () => {
    if (!isAuthReady) {
      Alert.alert("Aguarde", "Carregando dados de acesso...");
      return;
    }

    const user = email.trim();
    const password = senha.trim();

    if (!user || !password) {
      Alert.alert("Campos obrigatorios", "Informe usuario e senha para entrar.");
      return;
    }

    const authUser = authenticateUser(user, password);
    if (!authUser) {
      Alert.alert("Login invalido", "Usuario ou senha incorretos.");
      return;
    }

    router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={CURRENT_PLATFORM_UI.keyboardBehavior}
      >
        <View style={styles.content}>
          {/* --- LOGO E BOAS-VINDAS --- */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Image
                source={require("../assets/perfil.png")}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.title}>Terra Nova</Text>
            <Text style={styles.subtitle}>Conectando a agroecologia.</Text>
          </View>

          {/* --- FORMULÁRIO DE LOGIN --- */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail ou CPF</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.colors.gray_500}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu acesso"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.gray_500}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Sua senha secreta"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!mostrarSenha}
                />
                <TouchableOpacity
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={theme.colors.gray_500}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={fazerLogin}>
              <Text style={styles.loginButtonText}>{isAuthReady ? "Entrar" : "Carregando..."}</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={theme.colors.white}
                style={styles.submitIconSpacing}
              />
            </TouchableOpacity>
          </View>

          {/* --- RODAPÉ PARA CADASTRO --- */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ainda não faz parte da comunidade?
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>Criar minha conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, justifyContent: "center" },
  content: { flex: 1, padding: 24, justifyContent: "center" },

  header: { alignItems: "center", marginBottom: 40 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
  },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  subtitle: { fontSize: 16, color: theme.colors.gray_500 },

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
  eyeIcon: { padding: 8 },

  forgotPassword: { alignItems: "flex-end", marginBottom: 24 },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },

  loginButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  loginButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  footer: { marginTop: 40, alignItems: "center" },
  footerText: { fontSize: 14, color: theme.colors.gray_500, marginBottom: 8 },
  registerLink: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.orange_500,
  },
  submitIconSpacing: { marginLeft: 8 },
});
