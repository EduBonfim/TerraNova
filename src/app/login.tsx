import { useAuth } from "@/contexts/AuthContext";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  Layout, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const sanitizePasswordInput = (value: string) =>
  value.replace(/[^A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");

export default function LoginScreen() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);

  useEffect(() => {
    formOpacity.value = withTiming(1, { duration: 800 });
    formTranslateY.value = withSpring(0);
  }, []);

  const animatedFormStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }],
    };
  });

  const fazerLogin = async () => {
    const user = login.trim();
    const password = senha.trim();

    if (!user || !password) {
      Alert.alert(
        "Campos obrigatórios",
        "Informe usuário e senha para entrar.",
      );
      return;
    }

    setIsLoading(true);
    const authUser = await authLogin(user, password);

    if (!authUser) {
      setIsLoading(false);
      Alert.alert("Login inválido", "Usuário ou senha incorretos.");
      return;
    }

    // Delay para efeito visual de "processando"
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (authUser.role === "admin") {
      if (authUser.pendingLgpdReacceptance) {
        router.replace({
          pathname: "/privacy-lgpd",
          params: { forceConsent: "1" },
        });
        return;
      }
      router.replace("/(admin)/home");
      return;
    }

    if (authUser.role === "buyer") {
      router.replace("/(buyer)/home" as never);
      return;
    }

    router.replace("/(producer)/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative Background Elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.content}>
            {/* --- LOGO E BOAS-VINDAS --- */}
            <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/perfil.png")}
                  style={styles.logoImage}
                />
              </View>
              <Text style={styles.title}>Terra Nova</Text>
              <Text style={styles.subtitle}>Sua conexão com a terra e o futuro.</Text>
            </Animated.View>

            {/* --- FORMULÁRIO DE LOGIN (GLASSMORPHISM STYLE) --- */}
            <Animated.View style={[styles.loginCard, animatedFormStyle]}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Acesso à Conta</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="E-mail ou Usuário"
                    placeholderTextColor={theme.colors.gray_400}
                    value={login}
                    onChangeText={setLogin}
                    keyboardType="email-address"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { marginBottom: 12 }]}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Sua senha"
                    placeholderTextColor={theme.colors.gray_400}
                    value={senha}
                    onChangeText={(value) =>
                      setSenha(sanitizePasswordInput(value))
                    }
                    secureTextEntry={!mostrarSenha}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setMostrarSenha(!mostrarSenha)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.colors.gray_400}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Recuperar senha</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={fazerLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Entrar no Portal</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.white}
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* --- RODAPÉ PARA CADASTRO --- */}
            <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.footer}>
              <Text style={styles.footerText}>Novo por aqui?</Text>
              <TouchableOpacity
                onPress={() => router.push("/register-type" as never)}
                style={styles.registerBtn}
              >
                <Text style={styles.registerLink}>Crie sua conta agora</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAF8" },
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: "center" },

  // Background Decorations
  bgCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(107, 142, 35, 0.05)",
  },
  bgCircle2: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(249, 168, 37, 0.05)",
  },

  header: { alignItems: "center", marginBottom: 32 },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: { width: 90, height: 90, borderRadius: 30 },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: -1,
  },
  subtitle: { 
    fontSize: 15, 
    color: theme.colors.gray_500, 
    marginTop: 8,
    textAlign: "center",
    maxWidth: "80%",
  },

  // Login Card
  loginCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 32,
    padding: 24,
    width: "100%",
    // Neumorphic/Glass shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F1",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
  },
  inputIcon: { marginRight: 12 },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: theme.colors.gray_800,
    fontWeight: "500",
  },
  eyeIcon: { padding: 8 },

  forgotPassword: { alignItems: "flex-end", marginBottom: 24 },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  loginButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "800",
  },

  // Footer
  footer: { marginTop: 32, alignItems: "center" },
  footerText: { fontSize: 14, color: theme.colors.gray_500, marginBottom: 8 },
  registerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(249, 168, 37, 0.1)",
  },
  registerLink: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.orange_500,
  },
});
