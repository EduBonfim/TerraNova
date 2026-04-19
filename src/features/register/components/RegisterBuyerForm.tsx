import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { appTheme as theme } from "@/theme/appTheme";
import { registerStyles as styles } from "../styles/register.styles";
import { LGPD_TERMS_VERSION } from "@/services/authStore";

const sanitizeName = (v: string) => v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
const sanitizeLogin = (v: string) => v.replace(/[^A-Za-z0-9@._-]/g, "");
const sanitizePassword = (v: string) =>
  v.replace(/[^A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");

const normalizeCpf = (v: string) => v.replace(/\D/g, "").slice(0, 11);
const formatCpf = (v: string) => {
  const d = normalizeCpf(v);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

interface RegisterBuyerFormProps {
  nomeUsuario: string;
  setNomeUsuario: (val: string) => void;
  nomeCompleto: string;
  setNomeCompleto: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  cpf: string;
  setCpf: (val: string) => void;
  senha: string;
  setSenha: (val: string) => void;
  mostrarSenha: boolean;
  setMostrarSenha: (val: boolean | ((prev: boolean) => boolean)) => void;
  aceiteLgpd: boolean;
  setAceiteLgpd: (val: boolean | ((prev: boolean) => boolean)) => void;
  isAuthReady: boolean;
  onContinue: () => void;
}

export function RegisterBuyerForm({
  nomeUsuario,
  setNomeUsuario,
  nomeCompleto,
  setNomeCompleto,
  email,
  setEmail,
  cpf,
  setCpf,
  senha,
  setSenha,
  mostrarSenha,
  setMostrarSenha,
  aceiteLgpd,
  setAceiteLgpd,
  isAuthReady,
  onContinue,
}: RegisterBuyerFormProps) {
  const router = useRouter();

  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome de Usuário</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="at" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: joao_silva"
            placeholderTextColor={theme.colors.gray_800}
            value={nomeUsuario}
            onChangeText={(v) => setNomeUsuario(sanitizeLogin(v))}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome Completo</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: João da Silva"
            placeholderTextColor={theme.colors.gray_800}
            value={nomeCompleto}
            onChangeText={(v) => setNomeCompleto(sanitizeName(v))}
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail (opcional)</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor={theme.colors.gray_800}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>CPF <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <Ionicons name="card-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor={theme.colors.gray_800}
            value={cpf}
            onChangeText={(v) => setCpf(formatCpf(v))}
            keyboardType="number-pad"
            maxLength={14}
          />
        </View>
        <Text style={styles.helperText}>Usado para identificação única — evita cadastros duplicados.</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Senha <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="8+ com maiúsculas, números e especial"
            placeholderTextColor={theme.colors.gray_800}
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

      <TouchableOpacity style={styles.registerButton} onPress={onContinue}>
        <Text style={styles.registerButtonText}>{isAuthReady ? "Continuar" : "Carregando..."}</Text>
        <Ionicons name="arrow-forward" size={20} color={theme.colors.white} style={styles.submitIconSpacing} />
      </TouchableOpacity>

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
    </>
  );
}
