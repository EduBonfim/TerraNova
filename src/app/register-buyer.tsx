import { AppHeader } from "@/components/AppHeader";
import { initAuthStore, registerBuyer } from "@/services/authStore";
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
import { appTheme as theme } from "@/theme/appTheme";

import { registerStyles as styles } from "@/features/register/styles/register.styles";
import { AvatarImagePicker } from "@/features/register/components/AvatarImagePicker";
import { RegisterBuyerForm } from "@/features/register/components/RegisterBuyerForm";
import { AddressRegistrationModal, normalizeCep, formatCep } from "@/features/register/components/AddressRegistrationModal";
import { ToastNotification } from "@/features/register/components/ToastNotification";

const CURRENT_KEYBOARD_BEHAVIOR = Platform.OS === "ios" ? ("padding" as const) : undefined;

const normalizeCpf = (v: string) => v.replace(/\D/g, "").slice(0, 11);
const isCpfValid = (v: string) => normalizeCpf(v).length === 11;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,64}$/;
const isStrongPassword = (v: string) => STRONG_PASSWORD_REGEX.test(v);

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

  const validarFormulario = (): boolean => {
    const usuario = nomeUsuario.trim();
    const nome = nomeCompleto.trim();
    const mail = email.trim();
    const senhaLimpa = senha.trim();

    if (!usuario) { Alert.alert("Campo obrigatório", "Informe um nome de usuário."); return false; }
    if (!nome) { Alert.alert("Campo obrigatório", "Informe seu nome completo."); return false; }
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      Alert.alert("E-mail inválido", "Informe um endereço de e-mail válido."); return false;
    }
    if (!isCpfValid(cpf)) { Alert.alert("CPF inválido", "Informe um CPF válido com 11 dígitos."); return false; }
    if (!isStrongPassword(senhaLimpa)) {
      Alert.alert("Senha fraca", "Use 8 a 64 caracteres com letra maiúscula, minúscula, número e caractere especial.");
      return false;
    }
    if (!aceiteLgpd) {
      Alert.alert("Consentimento obrigatório", "Aceite os Termos de Privacidade e LGPD para continuar."); return false;
    }
    return true;
  };

  const abrirModalEndereco = () => {
    if (!validarFormulario()) return;
    setIsAddressModalOpen(true);
  };

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
      Alert.alert("Endereço incompleto", "Preencha CEP, Rua, Número, Bairro, Cidade e UF."); return;
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
      Alert.alert("Nome de usuário já usado", "Escolha outro nome de usuário."); return;
    }
    if (!result.ok && result.reason === "cpf_exists") {
      Alert.alert("CPF já cadastrado", "Este CPF já possui uma conta na plataforma."); return;
    }
    if (!result.ok) {
      Alert.alert("Erro no cadastro", "Verifique os dados e tente novamente."); return;
    }

    setIsAddressModalOpen(false);
    setToastMessage("Conta criada com sucesso! Redirecionando para o login...");
    setTimeout(() => {
      setToastMessage(null);
      router.replace("/login");
    }, 2800);
  };

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

          <AvatarImagePicker avatarUri={avatarUri} setAvatarUri={setAvatarUri} />

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
