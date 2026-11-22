import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { registerStyles as styles } from "@/features/register/styles/register.styles";
import { LegalConsentSection } from "./LegalConsentSection";
import {
  PasswordRequirementsModal,
  PasswordRequirementsInline,
} from "./PasswordRequirementsModal";

const sanitizeName = (v) => v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
const sanitizeLogin = (v) => v.replace(/[^A-Za-z0-9@._-]/g, "");
const sanitizePassword = (v) =>
  v.replace(/[^A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");

const normalizeCpf = (v) => v.replace(/\D/g, "").slice(0, 11);
const formatCpf = (v) => {
  const d = normalizeCpf(v);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

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
  aceiteTermos,
  setAceiteTermos,
  aceiteLgpd,
  setAceiteLgpd,
  isAuthReady,
  onContinue,
}) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome de Usuário</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="at"
            size={20}
            color={theme.colors.gray_500}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Ex: joao_silva"
            placeholderTextColor={theme.colors.placeholder}
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
          <Ionicons
            name="person-outline"
            size={20}
            color={theme.colors.gray_500}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Ex: João da Silva"
            placeholderTextColor={theme.colors.placeholder}
            value={nomeCompleto}
            onChangeText={(v) => setNomeCompleto(sanitizeName(v))}
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail (opcional)</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={theme.colors.gray_500}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor={theme.colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          CPF <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="card-outline"
            size={20}
            color={theme.colors.gray_500}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor={theme.colors.placeholder}
            value={cpf}
            onChangeText={(v) => setCpf(formatCpf(v))}
            keyboardType="number-pad"
            maxLength={14}
          />
        </View>
        <Text style={styles.helperText}>
          Usado para identificação única — evita cadastros duplicados.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelWithInfo}>
          <Text style={styles.label}>
            Senha <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setIsPasswordModalOpen(true)}
            style={styles.infoButton}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Requisitos da senha inline exibidos durante a digitação */}
        <PasswordRequirementsInline
          password={senha}
          visible={senha.length > 0}
        />

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={theme.colors.gray_500}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="8+ com maiúsculas, números e especial"
            placeholderTextColor={theme.colors.placeholder}
            value={senha}
            onChangeText={(v) => setSenha(sanitizePassword(v))}
            secureTextEntry={!mostrarSenha}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setMostrarSenha(!mostrarSenha)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={onContinue}>
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

      <LegalConsentSection
        aceiteTermos={aceiteTermos}
        setAceiteTermos={setAceiteTermos}
        aceiteLgpd={aceiteLgpd}
        setAceiteLgpd={setAceiteLgpd}
      />

      <PasswordRequirementsModal
        isVisible={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        password={senha}
      />
    </>
  );
}
