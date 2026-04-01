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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "../components/AppHeader";
import { initAuthStore, registerUser } from "../services/authStore";
import { useAuth } from "../contexts/AuthContext";

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

const normalizeCep = (value: string) => value.replace(/\D/g, "").slice(0, 8);

const formatCep = (value: string) => {
  const digits = normalizeCep(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const isEmailOrCpfValid = (value: string) => {
  const input = value.trim();
  const cpfDigits = input.replace(/\D/g, "");
  const isCpf = cpfDigits.length === 11;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  return isCpf || isEmail;
};

const sanitizeNameWithSpaces = (value: string) => value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");

const sanitizeLoginInput = (value: string) => value.replace(/[^A-Za-z0-9@._-]/g, "");

const sanitizePasswordInput = (value: string) =>
  value.replace(/[^A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,64}$/;

const isStrongPassword = (value: string) => STRONG_PASSWORD_REGEX.test(value);

export default function RegisterScreen() {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomePropriedade, setNomePropriedade] = useState("");
  const [loginUsuario, setLoginUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [complemento, setComplemento] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCepLookupLoading, setIsCepLookupLoading] = useState(false);
  const [lastResolvedCep, setLastResolvedCep] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      await initAuthStore();
      setIsAuthReady(true);
    };

    load();
  }, []);

  const validarDadosIniciais = () => {
    const nome = nomeCompleto.trim();
    const propriedade = nomePropriedade.trim();
    const login = loginUsuario.trim();
    const senhaLimpa = senha.trim();

    if (!nome || !propriedade || !login || !senhaLimpa) {
      Alert.alert(
        "Campos obrigatorios",
        "Preencha Nome completo, Nome da propriedade, Email ou CPF e Criar Senha.",
      );
      return false;
    }

    if (!isEmailOrCpfValid(login)) {
      Alert.alert("Login invalido", "Informe um Email valido ou CPF com 11 digitos.");
      return false;
    }

    if (!isStrongPassword(senhaLimpa)) {
      Alert.alert(
        "Senha invalida",
        "Use 8 a 64 caracteres, com letra maiuscula, minuscula, numero e caractere especial, sem espacos.",
      );
      return false;
    }

    return true;
  };

  const abrirModalEndereco = () => {
    if (!validarDadosIniciais()) return;
    setIsAddressModalOpen(true);
  };

  const resolveCepWithViaCep = async (cepValue: string) => {
    const cepDigits = normalizeCep(cepValue);
    if (cepDigits.length !== 8 || cepDigits === lastResolvedCep) return;

    try {
      setIsCepLookupLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };

      if (data.erro) {
        return;
      }

      if (data.logradouro) setRua(data.logradouro);
      if (data.bairro) setBairro(data.bairro);
      if (data.localidade) setCidade(data.localidade);
      if (data.uf) setUf(data.uf);
      setLastResolvedCep(cepDigits);
    } finally {
      setIsCepLookupLoading(false);
    }
  };

  const concluirCadastro = async () => {
    if (!isAuthReady) {
      Alert.alert("Aguarde", "Carregando dados de acesso...");
      return;
    }

    if (!validarDadosIniciais()) {
      return;
    }

    const nome = nomeCompleto.trim();
    const propriedade = nomePropriedade.trim();
    const usuario = loginUsuario.trim();
    const senhaLimpa = senha.trim();
    const cepDigits = normalizeCep(cep);
    const ruaValue = rua.trim();
    const numeroValue = numero.trim();
    const bairroValue = bairro.trim();
    const cidadeValue = cidade.trim();
    const ufValue = uf.trim().toUpperCase();
    const complementoValue = complemento.trim();

    if (!cepDigits || !ruaValue || !numeroValue || !bairroValue || !cidadeValue || !ufValue) {
      Alert.alert(
        "Endereco incompleto",
        "Preencha CEP, Rua, Numero, Bairro, Cidade e UF para concluir o cadastro.",
      );
      return;
    }

    if (cepDigits.length !== 8) {
      Alert.alert("CEP invalido", "Informe um CEP valido com 8 digitos.");
      return;
    }

    if (ufValue.length !== 2) {
      Alert.alert("UF invalida", "A UF deve conter 2 letras (ex: GO). ");
      return;
    }

    const result = await registerUser({
      username: usuario,
      password: senhaLimpa,
      fullName: nome,
      farmName: propriedade,
      address: {
        cep: formatCep(cepDigits),
        street: ruaValue,
        number: numeroValue,
        neighborhood: bairroValue,
        city: cidadeValue,
        state: ufValue,
        complement: complementoValue || undefined,
      },
    });

    if (!result.ok && result.reason === "exists") {
      Alert.alert("Usuario ja existe", "Use outro login para cadastrar.");
      return;
    }

    if (!result.ok) {
      Alert.alert("Cadastro invalido", "Verifique os dados e tente novamente.");
      return;
    }

    setIsAddressModalOpen(false);
    setToastMessage("Conta criada com sucesso! Redirecionando para o login...");
    setTimeout(() => {
      setToastMessage(null);
      router.replace("/login");
    }, 3000);
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
                  placeholderTextColor={theme.colors.gray_800}
                  value={nomeCompleto}
                  onChangeText={(value) => setNomeCompleto(sanitizeNameWithSpaces(value))}
                  keyboardType="default"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Propriedade</Text>
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
                  placeholderTextColor={theme.colors.gray_800}
                  value={nomePropriedade}
                  onChangeText={(value) => setNomePropriedade(sanitizeNameWithSpaces(value))}
                  keyboardType="default"
                  autoCorrect={false}
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
                  placeholderTextColor={theme.colors.gray_800}
                  value={loginUsuario}
                  onChangeText={(value) => setLoginUsuario(sanitizeLoginInput(value))}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
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
                  placeholder="8+ com maiusc/minusc, numero e especial"
                  placeholderTextColor={theme.colors.gray_800}
                  secureTextEntry={true}
                  value={senha}
                  onChangeText={(value) => setSenha(sanitizePasswordInput(value))}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={abrirModalEndereco}
            >
              <Text style={styles.registerButtonText}>
                {isAuthReady ? "Continuar" : "Carregando..."}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={theme.colors.white}
                style={styles.submitIconSpacing}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={isAddressModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddressModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Endereco da propriedade</Text>
              <TouchableOpacity onPress={() => setIsAddressModalOpen(false)}>
                <Ionicons name="close" size={22} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CEP</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="locate-outline"
                    size={20}
                    color={theme.colors.gray_500}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="00000-000"
                    placeholderTextColor={theme.colors.gray_800}
                    keyboardType="number-pad"
                    maxLength={9}
                    value={cep}
                    onChangeText={(value) => {
                      const formatted = formatCep(value);
                      setCep(formatted);

                      const cepDigits = normalizeCep(formatted);
                      if (cepDigits.length < 8) {
                        setLastResolvedCep("");
                        return;
                      }

                      void resolveCepWithViaCep(cepDigits);
                    }}
                  />
                </View>
                <Text style={styles.helperText}>
                  {isCepLookupLoading ? "Consultando CEP..." : "Ao completar o CEP, rua/bairro/cidade/UF sao preenchidos automaticamente."}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rua</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="map-outline"
                    size={20}
                    color={theme.colors.gray_500}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome da rua"
                    placeholderTextColor={theme.colors.gray_800}
                    value={rua}
                    onChangeText={setRua}
                    keyboardType="default"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.colSmall]}>
                  <Text style={styles.label}>Numero</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor={theme.colors.gray_800}
                      keyboardType="number-pad"
                      value={numero}
                      onChangeText={setNumero}
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.colLarge]}>
                  <Text style={styles.label}>Bairro</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Bairro"
                      placeholderTextColor={theme.colors.gray_800}
                      value={bairro}
                      onChangeText={setBairro}
                      keyboardType="default"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.colLarge]}>
                  <Text style={styles.label}>Cidade</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Cidade"
                      placeholderTextColor={theme.colors.gray_800}
                      value={cidade}
                      onChangeText={setCidade}
                      keyboardType="default"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.colSmall]}>
                  <Text style={styles.label}>UF</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="GO"
                      placeholderTextColor={theme.colors.gray_800}
                      autoCapitalize="characters"
                      maxLength={2}
                      value={uf}
                      onChangeText={(value) => setUf(value.replace(/[^A-Za-z]/g, "").toUpperCase())}
                      keyboardType="default"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Complemento (Opcional)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Casa, bloco, referencia"
                    placeholderTextColor={theme.colors.gray_800}
                    value={complemento}
                    onChangeText={setComplemento}
                    keyboardType="default"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.registerButton} onPress={concluirCadastro}>
                <Text style={styles.registerButtonText}>
                  {isAuthReady ? "Criar conta" : "Carregando..."}
                </Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={theme.colors.white}
                  style={styles.submitIconSpacing}
                />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {toastMessage ? (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={18} color={theme.colors.white} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "92%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  colSmall: {
    flex: 1,
  },
  colLarge: {
    flex: 2,
  },
  toastContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: "#15803D",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 4,
  },
  toastText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  helperText: {
    marginTop: 6,
    color: theme.colors.gray_500,
    fontSize: 12,
  },
  submitIconSpacing: { marginLeft: 8 },
});
