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
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { initAuthStore, LGPD_TERMS_VERSION, registerBuyer } from "@/services/authStore";

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

const CURRENT_KEYBOARD_BEHAVIOR =
  Platform.OS === "ios" ? ("padding" as const) : undefined;

// ─── Formatters ────────────────────────────────────────────────────────────────

const normalizeCep = (v: string) => v.replace(/\D/g, "").slice(0, 8);
const formatCep = (v: string) => {
  const d = normalizeCep(v);
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
};

const normalizeCpf = (v: string) => v.replace(/\D/g, "").slice(0, 11);
const formatCpf = (v: string) => {
  const d = normalizeCpf(v);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};
const isCpfValid = (v: string) => normalizeCpf(v).length === 11;

const sanitizeName = (v: string) => v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
const sanitizeLogin = (v: string) => v.replace(/[^A-Za-z0-9@._-]/g, "");
const sanitizePassword = (v: string) =>
  v.replace(/[^A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,64}$/;
const isStrongPassword = (v: string) => STRONG_PASSWORD_REGEX.test(v);

// ─── Component ─────────────────────────────────────────────────────────────────

export default function RegisterBuyerScreen() {
  const router = useRouter();

  // Form state
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aceiteLgpd, setAceiteLgpd] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [complemento, setComplemento] = useState("");
  const [lastResolvedCep, setLastResolvedCep] = useState("");
  const [isCepLoading, setIsCepLoading] = useState(false);

  // UI state
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    initAuthStore().then(() => setIsAuthReady(true));
  }, []);

  // ─── Avatar ──────────────────────────────────────────────────────────────────

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permissão", "Habilite o acesso à galeria."); return; }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!r.canceled) setAvatarUri(r.assets[0].uri);
  };

  const takeAvatar = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permissão", "Habilite o acesso à câmera."); return; }
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled) setAvatarUri(r.assets[0].uri);
  };

  const showAvatarOptions = () => {
    Alert.alert("Foto de Perfil", "Escolha uma opção", [
      { text: "Galeria", onPress: pickAvatar },
      { text: "Câmera", onPress: takeAvatar },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  // ─── Validation ──────────────────────────────────────────────────────────────

  const validarFormulario = (): boolean => {
    const usuario = nomeUsuario.trim();
    const nome = nomeCompleto.trim();
    const mail = email.trim();
    const senhaLimpa = senha.trim();

    if (!usuario) {
      Alert.alert("Campo obrigatório", "Informe um nome de usuário.");
      return false;
    }
    if (!nome) {
      Alert.alert("Campo obrigatório", "Informe seu nome completo.");
      return false;
    }
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      Alert.alert("E-mail inválido", "Informe um endereço de e-mail válido.");
      return false;
    }
    if (!isCpfValid(cpf)) {
      Alert.alert("CPF inválido", "Informe um CPF válido com 11 dígitos.");
      return false;
    }
    if (!isStrongPassword(senhaLimpa)) {
      Alert.alert(
        "Senha fraca",
        "Use 8 a 64 caracteres com letra maiúscula, minúscula, número e caractere especial.",
      );
      return false;
    }
    if (!aceiteLgpd) {
      Alert.alert("Consentimento obrigatório", "Aceite os Termos de Privacidade e LGPD para continuar.");
      return false;
    }
    return true;
  };

  const abrirModalEndereco = () => {
    if (!validarFormulario()) return;
    setIsAddressModalOpen(true);
  };

  // ─── CEP lookup ──────────────────────────────────────────────────────────────

  const resolveCep = async (cepValue: string) => {
    const digits = normalizeCep(cepValue);
    if (digits.length !== 8 || digits === lastResolvedCep) return;
    try {
      setIsCepLoading(true);
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) return;
      const data = await res.json() as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
      if (data.erro) return;
      if (data.logradouro) setRua(data.logradouro);
      if (data.bairro) setBairro(data.bairro);
      if (data.localidade) setCidade(data.localidade);
      if (data.uf) setUf(data.uf);
      setLastResolvedCep(digits);
    } finally {
      setIsCepLoading(false);
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const concluirCadastro = async () => {
    if (!isAuthReady) { Alert.alert("Aguarde", "Carregando..."); return; }
    if (!validarFormulario()) return;

    const cepDigits = normalizeCep(cep);
    const ruaVal = rua.trim();
    const numeroVal = numero.trim();
    const bairroVal = bairro.trim();
    const cidadeVal = cidade.trim();
    const ufVal = uf.trim().toUpperCase();

    if (!cepDigits || !ruaVal || !numeroVal || !bairroVal || !cidadeVal || !ufVal) {
      Alert.alert("Endereço incompleto", "Preencha CEP, Rua, Número, Bairro, Cidade e UF.");
      return;
    }
    if (cepDigits.length !== 8) { Alert.alert("CEP inválido", "Informe um CEP com 8 dígitos."); return; }
    if (ufVal.length !== 2) { Alert.alert("UF inválida", "A UF deve ter 2 letras (ex: SP)."); return; }

    const result = await registerBuyer({
      username: nomeUsuario.trim(),
      password: senha.trim(),
      fullName: nomeCompleto.trim() || undefined,
      email: email.trim() || undefined,
      cpf: normalizeCpf(cpf),
      acceptLgpd: aceiteLgpd,
      avatarUri: avatarUri || undefined,
      address: {
        cep: formatCep(cepDigits),
        street: ruaVal,
        number: numeroVal,
        neighborhood: bairroVal,
        city: cidadeVal,
        state: ufVal,
        complement: complemento.trim() || undefined,
      },
    });

    if (!result.ok && result.reason === "exists") {
      Alert.alert("Nome de usuário já usado", "Escolha outro nome de usuário.");
      return;
    }
    if (!result.ok && result.reason === "cpf_exists") {
      Alert.alert("CPF já cadastrado", "Este CPF já possui uma conta na plataforma.");
      return;
    }
    if (!result.ok) {
      Alert.alert("Erro no cadastro", "Verifique os dados e tente novamente.");
      return;
    }

    setIsAddressModalOpen(false);
    setToastMessage("Conta criada com sucesso! Redirecionando para o login...");
    setTimeout(() => {
      setToastMessage(null);
      router.replace("/login");
    }, 2800);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Cadastro de Comprador"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
        titleAlign="center"
        rightAccessory={<View style={{ width: 40 }} />}
      />

      <KeyboardAvoidingView style={styles.container} behavior={CURRENT_KEYBOARD_BEHAVIOR}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Crie sua conta</Text>
          <Text style={styles.pageSubtitle}>
            Preencha seus dados para comprar produtos agroecológicos diretamente dos produtores.
          </Text>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarCircle} onPress={showAvatarOptions}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="camera" size={30} color={theme.colors.primary} />
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="add" size={14} color={theme.colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarLabel}>Foto de perfil (opcional)</Text>
          </View>

          <View style={styles.form}>

            {/* Nome de Usuário */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome de Usuário</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="at" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: joao_silva"
                  placeholderTextColor={theme.colors.gray_500}
                  value={nomeUsuario}
                  onChangeText={(v) => setNomeUsuario(sanitizeLogin(v))}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Nome Completo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: João da Silva"
                  placeholderTextColor={theme.colors.gray_500}
                  value={nomeCompleto}
                  onChangeText={(v) => setNomeCompleto(sanitizeName(v))}
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* E-mail */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail (opcional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="seuemail@exemplo.com"
                  placeholderTextColor={theme.colors.gray_500}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* CPF */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  placeholderTextColor={theme.colors.gray_500}
                  value={cpf}
                  onChangeText={(v) => setCpf(formatCpf(v))}
                  keyboardType="number-pad"
                  maxLength={14}
                />
              </View>
              <Text style={styles.helperText}>Usado para identificação única — evita cadastros duplicados.</Text>
            </View>

            {/* Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="8+ caracteres, maiúsc., núm. e especial"
                  placeholderTextColor={theme.colors.gray_500}
                  value={senha}
                  onChangeText={(v) => setSenha(sanitizePassword(v))}
                  secureTextEntry={!mostrarSenha}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeBtn}>
                  <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={theme.colors.gray_500} />
                </TouchableOpacity>
              </View>
            </View>

            {/* LGPD */}
            <TouchableOpacity style={styles.lgpdRow} onPress={() => setAceiteLgpd((p) => !p)}>
              <Ionicons
                name={aceiteLgpd ? "checkbox" : "square-outline"}
                size={22}
                color={aceiteLgpd ? theme.colors.primary : theme.colors.gray_500}
              />
              <Text style={styles.lgpdText}>
                Li e aceito os Termos de Privacidade e LGPD (v{LGPD_TERMS_VERSION}).
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/privacy-lgpd")}>
              <Text style={styles.lgpdLink}>Ver termos e direitos LGPD</Text>
            </TouchableOpacity>

            {/* Botão Continuar */}
            <TouchableOpacity style={styles.button} onPress={abrirModalEndereco}>
              <Text style={styles.buttonText}>{isAuthReady ? "Continuar" : "Carregando..."}</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Modal de Endereço ────────────────────────────────────────────── */}
      <Modal
        visible={isAddressModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddressModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Endereço de entrega</Text>
                <Text style={styles.modalSubtitle}>Onde você quer receber seus pedidos?</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAddressModalOpen(false)}>
                <Ionicons name="close" size={22} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* CEP */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CEP</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="locate-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="00000-000"
                    placeholderTextColor={theme.colors.gray_500}
                    keyboardType="number-pad"
                    maxLength={9}
                    value={cep}
                    onChangeText={(v) => {
                      const formatted = formatCep(v);
                      setCep(formatted);
                      const digits = normalizeCep(formatted);
                      if (digits.length < 8) { setLastResolvedCep(""); return; }
                      void resolveCep(digits);
                    }}
                  />
                  {isCepLoading && <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 8 }} />}
                </View>
                {!isCepLoading && (
                  <Text style={styles.helperText}>CEP completo preenche rua, bairro e cidade automaticamente.</Text>
                )}
              </View>

              {/* Rua */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rua</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="map-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome da rua"
                    placeholderTextColor={theme.colors.gray_500}
                    value={rua}
                    onChangeText={setRua}
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Número + Bairro */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Número</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor={theme.colors.gray_500}
                      keyboardType="number-pad"
                      value={numero}
                      onChangeText={setNumero}
                    />
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 2.5, marginLeft: 10 }]}>
                  <Text style={styles.label}>Bairro</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Bairro"
                      placeholderTextColor={theme.colors.gray_500}
                      value={bairro}
                      onChangeText={setBairro}
                      autoCorrect={false}
                    />
                  </View>
                </View>
              </View>

              {/* Cidade + UF */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2.5 }]}>
                  <Text style={styles.label}>Cidade</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Cidade"
                      placeholderTextColor={theme.colors.gray_500}
                      value={cidade}
                      onChangeText={setCidade}
                      autoCorrect={false}
                    />
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.label}>UF</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="SP"
                      placeholderTextColor={theme.colors.gray_500}
                      autoCapitalize="characters"
                      maxLength={2}
                      value={uf}
                      onChangeText={(v) => setUf(v.replace(/[^A-Za-z]/g, "").toUpperCase())}
                    />
                  </View>
                </View>
              </View>

              {/* Complemento */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Complemento (opcional)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Apto, bloco, referência"
                    placeholderTextColor={theme.colors.gray_500}
                    value={complemento}
                    onChangeText={setComplemento}
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Botão Criar Conta */}
              <TouchableOpacity style={styles.button} onPress={concluirCadastro}>
                <Text style={styles.buttonText}>{isAuthReady ? "Criar conta" : "Carregando..."}</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.white} style={{ marginLeft: 8 }} />
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toastMessage ? (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color={theme.colors.white} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: 24, paddingBottom: 40 },

  pageTitle: {
    fontSize: 24, fontWeight: "bold", color: theme.colors.primary, marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14, color: theme.colors.gray_500, lineHeight: 20, marginBottom: 28,
  },

  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.colors.lightGreen,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: theme.colors.primary,
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: theme.colors.orange_500,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: theme.colors.white,
  },
  avatarLabel: { marginTop: 8, fontSize: 12, color: theme.colors.gray_500 },

  form: { width: "100%" },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "bold", color: theme.colors.gray_800, marginBottom: 8 },
  required: { color: "#E53E3E" },
  inputContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1, borderColor: theme.colors.gray_300,
    borderRadius: 12, paddingHorizontal: 12, height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: theme.colors.gray_800 },
  eyeBtn: { padding: 6 },
  helperText: { marginTop: 5, fontSize: 12, color: theme.colors.gray_500 },

  lgpdRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 4 },
  lgpdText: { flex: 1, fontSize: 13, color: theme.colors.gray_800, lineHeight: 18 },
  lgpdLink: { marginTop: 6, fontSize: 13, color: theme.colors.primary, fontWeight: "700" },

  button: {
    flexDirection: "row",
    backgroundColor: theme.colors.orange_500,
    height: 54, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
    marginTop: 16, elevation: 2,
  },
  buttonText: { color: theme.colors.white, fontSize: 17, fontWeight: "bold" },

  row: { flexDirection: "row" },

  // Modal
  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(17,24,39,0.5)", justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "88%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: theme.colors.gray_800 },
  modalSubtitle: { fontSize: 13, color: theme.colors.gray_500, marginTop: 2 },

  // Toast
  toast: {
    position: "absolute", bottom: 32, left: 24, right: 24,
    backgroundColor: theme.colors.primary,
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 12, elevation: 6,
  },
  toastText: { color: theme.colors.white, fontSize: 14, fontWeight: "600", flex: 1 },
});
