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

const sanitizeNameWithSpaces = (value) =>
  value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");

const normalizeDocument = (value) => value.replace(/\D/g, "");

const formatDocument = (value) => {
  const digits = normalizeDocument(value).slice(0, 14);

  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
      6,
      9
    )}-${digits.slice(9)}`;
  }

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
      5,
      8
    )}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const sanitizeLoginInput = (value) => value.replace(/[^A-Za-z0-9@._-]/g, "");

const sanitizePasswordInput = (value) =>
  value.replace(/[^A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");

export function RegisterAccountForm({
  nomeCompleto,
  setNomeCompleto,
  nomePropriedade,
  setNomePropriedade,
  loginUsuario,
  setLoginUsuario,
  documentoPropriedade,
  setDocumentoPropriedade,
  senha,
  setSenha,
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
            placeholderTextColor={theme.colors.placeholder}
            value={nomeCompleto}
            onChangeText={(value) =>
              setNomeCompleto(sanitizeNameWithSpaces(value))
            }
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
            placeholderTextColor={theme.colors.placeholder}
            value={nomePropriedade}
            onChangeText={(value) =>
              setNomePropriedade(sanitizeNameWithSpaces(value))
            }
            keyboardType="default"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail</Text>
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
            placeholderTextColor={theme.colors.placeholder}
            value={loginUsuario}
            onChangeText={(value) => setLoginUsuario(sanitizeLoginInput(value))}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>CPF ou CNPJ da Propriedade</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={theme.colors.gray_500}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Documento unico da propriedade"
            placeholderTextColor={theme.colors.placeholder}
            value={documentoPropriedade}
            onChangeText={(value) =>
              setDocumentoPropriedade(formatDocument(value))
            }
            keyboardType="number-pad"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelWithInfo}>
          <Text style={styles.label}>Criar Senha</Text>
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
            placeholder="8+ com maiusc/minusc, numero e especial"
            placeholderTextColor={theme.colors.placeholder}
            secureTextEntry={true}
            value={senha}
            onChangeText={(value) => setSenha(sanitizePasswordInput(value))}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
          />
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
