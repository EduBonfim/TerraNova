import { AppHeader } from "@/components/AppHeader";
import { initAuthStore, registerBuyer } from "@/services/authStore";
import { uploadImageDetailed } from "@/services/imageUploadService";
import { appTheme as theme } from "@/theme/appTheme";
import {
  checkRateLimit,
  clearRateLimitAttempts,
  recordRateLimitAttempt,
} from "@/utils/rateLimitUtils";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

import {
  AddressRegistrationModal,
  formatCep,
  normalizeCep,
} from "@/features/register/components/AddressRegistrationModal";
import { AvatarImagePicker } from "@/features/register/components/AvatarImagePicker";
import { RegisterBuyerForm } from "@/features/register/components/RegisterBuyerForm";
import { ToastNotification } from "@/features/register/components/ToastNotification";
import { registerStyles as styles } from "@/features/register/styles/register.styles";

const CURRENT_KEYBOARD_BEHAVIOR = Platform.OS === "ios" ? "padding" : "height";

const normalizeCpf = (v) => v.replace(/\D/g, "").slice(0, 11);
const isCpfValid = (v) => {
  const cpf = normalizeCpf(v);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (base, factor) => {
    const sum = base
      .split("")
      .reduce((acc, digit) => acc + Number(digit) * factor--, 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const firstDigit = calcDigit(cpf.slice(0, 9), 10);
  const secondDigit = calcDigit(cpf.slice(0, 10), 11);
  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
};
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,64}$/;
const isStrongPassword = (v) => STRONG_PASSWORD_REGEX.test(v);
const REGISTER_MAX_ATTEMPTS = 10;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

const formatRemainingMinutes = (remainingMs) =>
  Math.max(1, Math.ceil((remainingMs || REGISTER_WINDOW_MS) / 60000));

export default function RegisterBuyerScreen() {
  const router = useRouter();

  // Form state
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [aceiteLgpd, setAceiteLgpd] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    initAuthStore().then(() => setIsAuthReady(true));
  }, []);

  const validarFormulario = () => {
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
        "Use 8 a 64 caracteres com letra maiúscula, minúscula, número e caractere especial."
      );
      return false;
    }
    if (!aceiteTermos) {
      Alert.alert(
        "Termos de Uso",
        "Leia e aceite os Termos de Uso para continuar."
      );
      return false;
    }
    if (!aceiteLgpd) {
      Alert.alert(
        "Consentimento obrigatório",
        "Leia e aceite a Política de Privacidade e LGPD para continuar."
      );
      return false;
    }
    return true;
  };

  const abrirModalEndereco = () => {
    if (!validarFormulario()) return;
    setIsAddressModalOpen(true);
  };

  const resolveCep = async (cepValue) => {
    const digits = normalizeCep(cepValue);
    if (digits.length !== 8 || digits === lastResolvedCep) return;
    try {
      setIsCepLoading(true);
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) return;

      const data = await res.json();

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

  const concluirCadastro = async () => {
    if (isSubmitting) return;

    if (!isAuthReady) {
      Alert.alert("Aguarde", "Carregando...");
      return;
    }
    if (!validarFormulario()) return;

    const cepDigits = normalizeCep(cep);
    const ruaVal = rua.trim();
    const numeroVal = numero.trim();
    const bairroVal = bairro.trim();
    const cidadeVal = cidade.trim();
    const ufVal = uf.trim().toUpperCase();

    if (
      !cepDigits ||
      !ruaVal ||
      !numeroVal ||
      !bairroVal ||
      !cidadeVal ||
      !ufVal
    ) {
      Alert.alert(
        "Endereço incompleto",
        "Preencha CEP, Rua, Número, Bairro, Cidade e UF."
      );
      return;
    }
    if (cepDigits.length !== 8) {
      Alert.alert("CEP inválido", "Informe um CEP com 8 dígitos.");
      return;
    }
    if (ufVal.length !== 2) {
      Alert.alert("UF inválida", "A UF deve ter 2 letras (ex: SP).");
      return;
    }

    const rateLimitKey = `register:buyer:${nomeUsuario.trim()}`;
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
      const result = await registerBuyer({
        username: nomeUsuario.trim(),
        password: senha.trim(),
        fullName: nomeCompleto.trim() || undefined,
        email: email.trim() || undefined,
        cpf: normalizeCpf(cpf),
        acceptTerms: aceiteTermos,
        acceptLgpd: aceiteLgpd,
        avatarUri: remoteAvatarUrl || undefined,
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

      if (!result.ok) {
        setToastMessage(null);
        await recordRateLimitAttempt(rateLimitKey, REGISTER_WINDOW_MS);

        if (result.reason === "exists") {
          Alert.alert(
            "Nome de usuário já usado",
            result.message || "Escolha outro nome de usuário."
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
        if (result.reason === "cpf_exists") {
          Alert.alert(
            "CPF já cadastrado",
            result.message || "Este CPF já possui uma conta na plataforma."
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
      }, 2800);
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
        title="Cadastro de Comprador"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
        titleAlign="center"
        rightAccessory={<View style={{ width: 40 }} />}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={CURRENT_KEYBOARD_BEHAVIOR}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Crie sua conta</Text>
          <Text style={styles.pageSubtitle}>
            Preencha seus dados para comprar produtos agroecológicos diretamente
            dos produtores.
          </Text>

          <AvatarImagePicker
            avatarUri={avatarUri}
            setAvatarUri={setAvatarUri}
          />

          <View style={styles.form}>
            <RegisterBuyerForm
              nomeUsuario={nomeUsuario}
              setNomeUsuario={setNomeUsuario}
              nomeCompleto={nomeCompleto}
              setNomeCompleto={setNomeCompleto}
              email={email}
              setEmail={setEmail}
              cpf={cpf}
              setCpf={setCpf}
              senha={senha}
              setSenha={setSenha}
              mostrarSenha={mostrarSenha}
              setMostrarSenha={setMostrarSenha}
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
        isCepLookupLoading={isCepLoading}
        onCepChangeAndLookup={resolveCep}
        isAuthReady={isAuthReady}
        onConcluir={concluirCadastro}
        title="Endereço de entrega"
        subtitle="Onde você quer receber seus pedidos?"
      />

      {toastMessage ? <ToastNotification message={toastMessage} /> : null}
    </SafeAreaView>
  );
}
