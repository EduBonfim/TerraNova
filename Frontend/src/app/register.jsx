import { AppHeader } from "@/components/AppHeader";
import { initAuthStore, registerUser } from "@/services/authStore";
import { uploadImageDetailed } from "@/services/imageUploadService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  checkRateLimit,
  clearRateLimitAttempts,
  recordRateLimitAttempt,
} from "@/utils/rateLimitUtils";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appTheme as theme } from "@/theme/appTheme";

import { registerStyles as styles } from "@/features/register/styles/register.styles";
import { AvatarImagePicker } from "@/features/register/components/AvatarImagePicker";
import { RegisterAccountForm } from "@/features/register/components/RegisterAccountForm";
import {
  AddressRegistrationModal,
  normalizeCep,
  formatCep,
} from "@/features/register/components/AddressRegistrationModal";
import { ToastNotification } from "@/features/register/components/ToastNotification";

const IOS_VISUAL = {
  keyboardBehavior: "padding",
};

const ANDROID_VISUAL = {
  keyboardBehavior: "height",
};

const CURRENT_KEYBOARD_BEHAVIOR =
  Platform.OS === "ios"
    ? IOS_VISUAL.keyboardBehavior
    : ANDROID_VISUAL.keyboardBehavior;

const normalizeDocument = (value) => value.replace(/\D/g, "");

const isFarmDocumentValid = (value) => {
  const digits = normalizeDocument(value);
  return digits.length === 11 || digits.length === 14;
};

const isEmailOrCpfValid = (value) => {
  const input = value.trim();
  const cpfDigits = input.replace(/\D/g, "");
  const isCpf = cpfDigits.length === 11;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  return isCpf || isEmail;
};

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,64}$/;

const isStrongPassword = (value) => STRONG_PASSWORD_REGEX.test(value);
const REGISTER_MAX_ATTEMPTS = 10;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

const formatRemainingMinutes = (remainingMs) =>
  Math.max(1, Math.ceil((remainingMs || REGISTER_WINDOW_MS) / 60000));

export default function RegisterScreen() {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomePropriedade, setNomePropriedade] = useState("");
  const [documentoPropriedade, setDocumentoPropriedade] = useState("");
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
  const [toastMessage, setToastMessage] = useState(null);
  const [isCepLookupLoading, setIsCepLookupLoading] = useState(false);
  const [lastResolvedCep, setLastResolvedCep] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [aceiteLgpd, setAceiteLgpd] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);

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
    const documento = documentoPropriedade.trim();
    const login = loginUsuario.trim();
    const senhaLimpa = senha.trim();

    if (!nome || !propriedade || !documento || !login || !senhaLimpa) {
      Alert.alert(
        "Campos obrigatorios",
        "Preencha Nome completo, Nome da propriedade, CPF/CNPJ da propriedade, Email ou CPF e Criar Senha."
      );
      return false;
    }

    if (!isFarmDocumentValid(documento)) {
      Alert.alert(
        "Documento invalido",
        "Informe CPF (11 digitos) ou CNPJ (14 digitos) da propriedade/responsavel."
      );
      return false;
    }

    if (!isEmailOrCpfValid(login)) {
      Alert.alert(
        "Login invalido",
        "Informe um Email valido ou CPF com 11 digitos."
      );
      return false;
    }

    if (!isStrongPassword(senhaLimpa)) {
      Alert.alert(
        "Senha invalida",
        "Use 8 a 64 caracteres, com letra maiuscula, minuscula, numero e caractere especial, sem espacos."
      );
      return false;
    }

    if (!aceiteTermos) {
      Alert.alert(
        "Termos de Uso",
        "Você precisa ler e aceitar os Termos de Uso para concluir o cadastro."
      );
      return false;
    }

    if (!aceiteLgpd) {
      Alert.alert(
        "Consentimento obrigatório",
        "Você precisa ler e aceitar a Política de Privacidade e LGPD para concluir o cadastro."
      );
      return false;
    }

    return true;
  };

  const abrirModalEndereco = () => {
    if (!validarDadosIniciais()) return;
    setIsAddressModalOpen(true);
  };

  const resolveCepWithViaCep = async (cepDigits) => {
    if (cepDigits.length !== 8 || cepDigits === lastResolvedCep) return;

    try {
      setIsCepLookupLoading(true);
      const response = await fetch(
        `https://viacep.com.br/ws/${cepDigits}/json/`
      );
      if (!response.ok) return;

      const data = await response.json();

      if (data.erro) return;

      if (data.logradouro) setRua(data.logradouro);
      if (data.bairro) setBairro(data.bairro);
      if (data.localidade) setCidade(data.localidade);
      if (data.uf) setUf(data.uf);
      setLastResolvedCep(cepDigits);
    } finally {
      setIsCepLookupLoading(false);
    }
  };

  const handleCepChange = (formattedCep) => {
    const cepDigits = normalizeCep(formattedCep);
    if (cepDigits.length < 8) {
      setLastResolvedCep("");
      return;
    }
    void resolveCepWithViaCep(cepDigits);
  };

  const concluirCadastro = async () => {
    if (isSubmitting) return;

    if (!isAuthReady) {
      Alert.alert("Aguarde", "Carregando dados de acesso...");
      return;
    }

    if (!validarDadosIniciais()) {
      return;
    }

    const nome = nomeCompleto.trim();
    const propriedade = nomePropriedade.trim();
    const documento = normalizeDocument(documentoPropriedade);
    const usuario = loginUsuario.trim();
    const senhaLimpa = senha.trim();
    const cepDigits = normalizeCep(cep);
    const ruaValue = rua.trim();
    const numeroValue = numero.trim();
    const bairroValue = bairro.trim();
    const cidadeValue = cidade.trim();
    const ufValue = uf.trim().toUpperCase();
    const complementoValue = complemento.trim();

    if (
      !cepDigits ||
      !ruaValue ||
      !numeroValue ||
      !bairroValue ||
      !cidadeValue ||
      !ufValue
    ) {
      Alert.alert(
        "Endereco incompleto",
        "Preencha CEP, Rua, Numero, Bairro, Cidade e UF para concluir o cadastro."
      );
      return;
    }

    if (cepDigits.length !== 8) {
      Alert.alert("CEP invalido", "Informe um CEP valido com 8 digitos.");
      return;
    }

    if (ufValue.length !== 2) {
      Alert.alert("UF invalida", "A UF deve conter 2 letras (ex: SP). ");
      return;
    }

    const rateLimitKey = `register:producer:${usuario}`;
    const limit = await checkRateLimit(
      rateLimitKey,
      REGISTER_MAX_ATTEMPTS,
      REGISTER_WINDOW_MS
    );
    if (limit.isBlocked) {
      Alert.alert(
        "Muitas tentativas",
        `Aguarde ${formatRemainingMinutes(
          limit.remainingMs
        )} min antes de tentar cadastrar novamente.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let remoteAvatarUrl = undefined;
      if (avatarUri) {
        setToastMessage("Fazendo upload da foto...");
        const uploadResult = await uploadImageDetailed(avatarUri);
        if (!uploadResult.url) {
          Alert.alert(
            "Erro no envio da foto",
            uploadResult.error ||
              "Não foi possível enviar a foto de perfil. Verifique sua conexão e tente novamente."
          );
          setToastMessage(null);
          return;
        }
        remoteAvatarUrl = uploadResult.url;
      }

      setToastMessage("Criando sua conta...");
      const result = await registerUser({
        username: usuario,
        password: senhaLimpa,
        acceptTerms: aceiteTermos,
        acceptLgpd: aceiteLgpd,
        fullName: nome,
        farmName: propriedade,
        farmDocument: documento,
        avatarUri: remoteAvatarUrl || undefined,
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

      if (!result.ok) {
        setToastMessage(null);
        await recordRateLimitAttempt(rateLimitKey, REGISTER_WINDOW_MS);

        if (result.reason === "exists") {
          Alert.alert(
            "Login já cadastrado",
            result.message || "Este login já está em uso. Escolha outro."
          );
          return;
        }

        if (result.reason === "email_exists") {
          Alert.alert(
            "E-mail já cadastrado",
            result.message || "Este e-mail já está cadastrado em outra conta."
          );
          return;
        }

        if (result.reason === "document_exists" || result.reason === "cpf_exists") {
          Alert.alert(
            "Documento já cadastrado",
            result.message ||
              "Já existe cadastro com este CPF/CNPJ de propriedade."
          );
          return;
        }

        if (result.reason === "banned") {
          Alert.alert(
            "Cadastro bloqueado",
            result.message ||
              "Este CPF está impedido de criar uma nova conta na plataforma."
          );
          return;
        }

        if (result.reason === "network") {
          Alert.alert(
            "Erro de conexão",
            result.message ||
              "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
          );
          return;
        }

        Alert.alert(
          "Erro no cadastro",
          result.message || "Verifique os dados informados e tente novamente."
        );
        return;
      }

      await clearRateLimitAttempts(rateLimitKey);
      setIsAddressModalOpen(false);
      setToastMessage("Conta criada com sucesso! Redirecionando para o login...");
      setTimeout(() => {
        setToastMessage(null);
        router.replace("/login");
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Nova Conta"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
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
            <AvatarImagePicker
              avatarUri={avatarUri}
              setAvatarUri={setAvatarUri}
            />

            <RegisterAccountForm
              nomeCompleto={nomeCompleto}
              setNomeCompleto={setNomeCompleto}
              nomePropriedade={nomePropriedade}
              setNomePropriedade={setNomePropriedade}
              loginUsuario={loginUsuario}
              setLoginUsuario={setLoginUsuario}
              documentoPropriedade={documentoPropriedade}
              setDocumentoPropriedade={setDocumentoPropriedade}
              senha={senha}
              setSenha={setSenha}
              aceiteTermos={aceiteTermos}
              setAceiteTermos={setAceiteTermos}
              aceiteLgpd={aceiteLgpd}
              setAceiteLgpd={setAceiteLgpd}
              isAuthReady={isAuthReady}
              onContinue={abrirModalEndereco}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AddressRegistrationModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        cep={cep}
        setCep={setCep}
        rua={rua}
        setRua={setRua}
        numero={numero}
        setNumero={setNumero}
        bairro={bairro}
        setBairro={setBairro}
        cidade={cidade}
        setCidade={setCidade}
        uf={uf}
        setUf={setUf}
        complemento={complemento}
        setComplemento={setComplemento}
        isCepLookupLoading={isCepLookupLoading}
        onCepChangeAndLookup={handleCepChange}
        isAuthReady={isAuthReady}
        onConcluir={concluirCadastro}
      />

      {toastMessage ? <ToastNotification message={toastMessage} /> : null}
    </SafeAreaView>
  );
}
