import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { appTheme as theme } from "@/theme/appTheme";
import { registerStyles as styles } from "@/features/register/styles/register.styles";

export const normalizeCep = (value) => value.replace(/\D/g, "").slice(0, 8);

export const formatCep = (value) => {
  const digits = normalizeCep(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export function AddressRegistrationModal({
  isOpen,
  onClose,
  cep,
  setCep,
  rua,
  setRua,
  numero,
  setNumero,
  bairro,
  setBairro,
  cidade,
  setCidade,
  uf,
  setUf,
  complemento,
  setComplemento,
  isCepLookupLoading,
  onCepChangeAndLookup,
  isAuthReady,
  onConcluir,
  title = "Endereço da propriedade",
  subtitle,
}) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{title}</Text>
              {subtitle && <Text style={styles.modalSubtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity onPress={onClose}>
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
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="number-pad"
                  maxLength={9}
                  value={cep}
                  onChangeText={(val) => {
                    const formatted = formatCep(val);
                    setCep(formatted);
                    onCepChangeAndLookup(formatted);
                  }}
                />
              </View>
              <Text style={styles.helperText}>
                {isCepLookupLoading
                  ? "Consultando CEP..."
                  : "Ao completar o CEP, rua/bairro/cidade/UF sao preenchidos automaticamente."}
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
                  placeholderTextColor={theme.colors.placeholder}
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
                    placeholderTextColor={theme.colors.placeholder}
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
                    placeholderTextColor={theme.colors.placeholder}
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
                    placeholderTextColor={theme.colors.placeholder}
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
                    placeholderTextColor={theme.colors.placeholder}
                    autoCapitalize="characters"
                    maxLength={2}
                    value={uf}
                    onChangeText={(value) =>
                      setUf(value.replace(/[^A-Za-z]/g, "").toUpperCase())
                    }
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
                  placeholderTextColor={theme.colors.placeholder}
                  value={complemento}
                  onChangeText={setComplemento}
                  keyboardType="default"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={onConcluir}
            >
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
  );
}
