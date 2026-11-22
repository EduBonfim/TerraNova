import { useAuth } from "@/contexts/AuthContext";
import { appTheme as theme } from "@/theme/appTheme";
import {
  checkRateLimit,
  clearLoginAttempts,
  recordLoginAttempt,
} from "@/utils/rateLimitUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { formatRemainingTime } from "@/services/reportsStore";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: _width, height: _height } = Dimensions.get("window");

const sanitizePasswordInput = (value) =>
  value.replace(/[^A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const formatRemainingMinutes = (remainingMs) =>
  Math.max(1, Math.ceil((remainingMs || LOGIN_WINDOW_MS) / 60000));

export default function LoginScreen() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [banError, setBanError] = useState(null);

  // Animação de entrada para o formulário de login
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
        "Informe usuário e senha para entrar."
      );
      return;
    }

    const limit = await checkRateLimit(
      user,
      LOGIN_MAX_ATTEMPTS,
      LOGIN_WINDOW_MS
    );
    if (limit.isBlocked) {
      Alert.alert(
        "Muitas tentativas",
        `Aguarde ${formatRemainingMinutes(
          limit.remainingMs
        )} min antes de tentar novamente.`
      );
      return;
    }

    setIsLoading(true);

    try {
      setBanError(null);
      const authUser = await authLogin(user, password);

      if (!authUser) {
        await recordLoginAttempt(user, LOGIN_WINDOW_MS);
        Alert.alert("Login inválido", "Usuário ou senha incorretos.");
        return;
      }

      await clearLoginAttempts(user);
      await new Promise((resolve) => setTimeout(resolve, 300));

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
        router.replace("/(buyer)/home");
        return;
      }

      router.replace("/(producer)/home");
    } catch (error) {
      try {
        const errObj = JSON.parse(error.message);
        if (errObj.isBan) {
          setBanError(errObj);
          return;
        }
      } catch (_e) {}

      Alert.alert(
        "Falha de conexão",
        "Não foi possível concluir o login agora. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decoração do fundo */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.content}>
            {/* --- LOGO E BOAS-VINDAS --- */}
            <Animated.View
              entering={FadeInUp.delay(200).duration(800)}
              style={styles.header}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/perfil.png")}
                  style={styles.logoImage}
                />
              </View>
              <Text style={styles.title}>Terra Nova</Text>
              <Text style={styles.subtitle}>
                Sua conexão com a terra e o futuro.
              </Text>
            </Animated.View>

            {/* --- FORMULÁRIO DE LOGIN (GLASSMORPHISM STYLE) --- */}
            <Animated.View style={[styles.loginCard, animatedFormStyle]}>
              {banError ? (
                <Animated.View
                  entering={FadeInDown.duration(300)}
                  style={[
                    styles.banErrorContainer,
                    banError.type === "bloqueio_temporario"
                      ? styles.banErrorTemp
                      : styles.banErrorPerm,
                  ]}
                >
                  <View style={styles.banErrorHeader}>
                    <Ionicons
                      name={
                        banError.type === "bloqueio_temporario"
                          ? "time-outline"
                          : "ban"
                      }
                      size={20}
                      color={
                        banError.type === "bloqueio_temporario"
                          ? "#D97706"
                          : "#DC2626"
                      }
                    />
                    <Text
                      style={[
                        styles.banErrorTitle,
                        banError.type === "bloqueio_temporario"
                          ? styles.banErrorTitleTemp
                          : styles.banErrorTitlePerm,
                      ]}
                    >
                      {banError.type === "bloqueio_temporario"
                        ? "Conta Suspensa Temporariamente"
                        : "Conta Suspensa Permanentemente"}
                    </Text>
                  </View>

                  <View style={styles.banErrorDetails}>
                    <Text style={styles.banErrorLabel}>
                      Motivo:{" "}
                      <Text style={styles.banErrorValue}>
                        {banError.reason}
                      </Text>
                    </Text>
                    {banError.details ? (
                      <Text style={styles.banErrorLabel}>
                        Detalhes:{" "}
                        <Text style={styles.banErrorValueText}>
                          {banError.details}
                        </Text>
                      </Text>
                    ) : null}
                    {banError.type === "bloqueio_temporario" &&
                    banError.expiresAt ? (
                      <View style={styles.banTimeBox}>
                        <Ionicons
                          name="hourglass-outline"
                          size={14}
                          color="#D97706"
                        />
                        <Text style={styles.banTimeText}>
                          Tempo restante:{" "}
                          {formatRemainingTime(banError.expiresAt)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Animated.View>
              ) : null}

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
                    placeholder="E-mail"
                    placeholderTextColor={theme.colors.placeholder}
                    value={login}
                    onChangeText={(value) => {
                      setLogin(value);
                      if (banError) setBanError(null);
                    }}
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
                    placeholderTextColor={theme.colors.placeholder}
                    value={senha}
                    onChangeText={(value) => {
                      setSenha(sanitizePasswordInput(value));
                      if (banError) setBanError(null);
                    }}
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
            <Animated.View
              entering={FadeInDown.delay(600).duration(800)}
              style={styles.footer}
            >
              <Text style={styles.footerText}>Novo por aqui?</Text>
              <TouchableOpacity
                onPress={() => router.push("/register-type")}
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
  banErrorContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  banErrorTemp: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  banErrorPerm: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  banErrorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  banErrorTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  banErrorTitleTemp: {
    color: "#D97706",
  },
  banErrorTitlePerm: {
    color: "#DC2626",
  },
  banErrorDetails: {
    gap: 6,
  },
  banErrorLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.gray_600,
  },
  banErrorValue: {
    fontWeight: "800",
    color: theme.colors.gray_800,
  },
  banErrorValueText: {
    fontWeight: "500",
    color: theme.colors.gray_700,
  },
  banTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(217, 119, 6, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: "flex-start",
    gap: 6,
  },
  banTimeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#D97706",
  },
});
