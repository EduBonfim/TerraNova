import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { PinModal } from "@/features/account/components/modals/PinModal";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { updateUserBuyerProfile } from "@/services/authStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditAddressScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const {
    isCepResolving,
    resolveCepAndOpenPin,
    isPinModalOpen,
    onClosePinModal,
    draftGateCoords,
    onMapPressSetGate,
    onConfirmPin,
  } = useAccountLogic();

  const [form, setForm] = useState({
    recipientName: user?.recipientName || user?.fullName || "",
    phone: user?.phone || "",
    cep: user?.address?.cep || "",
    state: user?.address?.state?.split(" - ")[0] || "",
    city: user?.address?.city || "",
    neighborhood: user?.address?.neighborhood || "",
    street: user?.address?.street || "",
    number: user?.address?.number || "",
    complement: user?.address?.complement || "",
    isDefaultAddress: false,
    isPickupAddress: false,
    isReturnAddress: false,
    addressType: "home",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastResolvedCep, setLastResolvedCep] = useState("");
  const [isCepLoading, setIsCepLoading] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      if (!user?.username) return;
      try {
        const stored = await AsyncStorage.getItem(
          `address_options_${user.username}`
        );
        if (stored) {
          const parsed = JSON.parse(stored);
          setForm((prev) => ({
            ...prev,
            isDefaultAddress: parsed.isDefaultAddress ?? false,
            isPickupAddress: parsed.isPickupAddress ?? false,
            isReturnAddress: parsed.isReturnAddress ?? false,
            addressType: parsed.addressType ?? "home",
          }));
        }
      } catch (e) {
        console.warn("Failed to load address options", e);
      }
    };
    loadOptions();
  }, [user?.username]);

  const handleSave = async () => {
    if (!form.recipientName.trim()) {
      Alert.alert("Campo obrigatório", "Digite o nome do destinatário");
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert("Campo obrigatório", "Digite o número de telefone");
      return;
    }
    if (!form.cep.trim()) {
      Alert.alert("Campo obrigatório", "Digite o CEP");
      return;
    }
    if (!form.street.trim()) {
      Alert.alert("Campo obrigatório", "Digite o nome da rua");
      return;
    }
    if (!form.number.trim()) {
      Alert.alert("Campo obrigatório", "Digite o número");
      return;
    }

    setIsSaving(true);
    try {
      await updateUserBuyerProfile(user?.username || "", {
        recipientName: form.recipientName,
        phone: form.phone,
        address: {
          cep: form.cep,
          street: form.street,
          number: form.number,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
          complement: form.complement,
        },
      });

      await AsyncStorage.setItem(
        `address_options_${user?.username}`,
        JSON.stringify({
          isDefaultAddress: form.isDefaultAddress,
          isPickupAddress: form.isPickupAddress,
          isReturnAddress: form.isReturnAddress,
          addressType: form.addressType,
        })
      );

      await refreshUser();

      Alert.alert("Sucesso", "Endereço salvo com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (_error) {
      Alert.alert("Erro", "Não foi possível salvar o endereço");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = () => {
    Alert.alert(
      "Excluir endereço",
      "Tem certeza que deseja remover este endereço?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            Alert.alert("Sucesso", "Endereço excluído com sucesso");
            router.back();
          },
        },
      ]
    );
  };

  const formatPhone = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7)
      return `(${cleaned.slice(0, 2)})${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 7)}-${cleaned.slice(
      7,
      11
    )}`;
  };

  const formatCep = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  const normalizeCep = (text) => text.replace(/\D/g, "").slice(0, 8);

  const resolveCep = async (cepValue) => {
    const digits = normalizeCep(cepValue);
    if (digits.length !== 8 || digits === lastResolvedCep) return;

    try {
      setIsCepLoading(true);
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) return;

      const data = await res.json();

      if (data.erro) {
        Alert.alert("CEP não encontrado", "Verifique o CEP e tente novamente.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      }));

      setLastResolvedCep(digits);
    } catch (_error) {
      Alert.alert("Erro", "Não foi possível consultar o CEP.");
    } finally {
      setIsCepLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Editar endereço"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.containerScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContent}>
            {/* ─── Endereço ─── */}
            <Text style={styles.sectionTitle}>Endereço</Text>

            <Text style={styles.label}>Nome do Destinatário</Text>
            <TextInput
              style={styles.input}
              placeholder="Quem recebará a encomenda?"
              placeholderTextColor={theme.colors.placeholder}
              value={form.recipientName}
              onChangeText={(text) => setForm({ ...form, recipientName: text })}
            />

            <Text style={styles.label}>Número de telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="Número de telefone"
              placeholderTextColor={theme.colors.placeholder}
              value={form.phone}
              onChangeText={(text) =>
                setForm({ ...form, phone: formatPhone(text) })
              }
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>CEP</Text>
            <TextInput
              style={styles.input}
              placeholder="CEP"
              placeholderTextColor={theme.colors.placeholder}
              value={form.cep}
              onChangeText={(text) => {
                const formatted = formatCep(text);
                setForm({ ...form, cep: formatted });
                const digits = normalizeCep(formatted);
                if (digits.length < 8) {
                  setLastResolvedCep("");
                  return;
                }
                void resolveCep(digits);
              }}
              keyboardType="number-pad"
              maxLength={9}
            />
            {isCepLoading && (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={{ marginTop: 8 }}
              />
            )}
            {!isCepLoading && (
              <Text style={styles.cepHelperText}>
                CEP completo preenche rua, bairro, cidade e estado
                automaticamente.
              </Text>
            )}

            {/* ─── Botão de validação do CEP / pin ─── */}
            <TouchableOpacity
              style={styles.validateCepButton}
              onPress={() => resolveCepAndOpenPin(form.cep)}
              disabled={isCepResolving}
            >
              {isCepResolving ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Ionicons
                    name="pin-outline"
                    size={16}
                    color={theme.colors.white}
                  />
                  <Text style={styles.validateCepButtonText}>
                    Marcar endereço no mapa
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.cepHelperText}>
              Use o PIN para marcar com precisão exatamente onde fica sua casa.
            </Text>

            <Text style={styles.label}>Estado - Cidade</Text>
            <View style={styles.twoColumnRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Estado"
                placeholderTextColor={theme.colors.placeholder}
                value={form.state}
                onChangeText={(text) => setForm({ ...form, state: text })}
                maxLength={2}
              />
              <View style={{ width: 8 }} />
              <TextInput
                style={[styles.input, { flex: 2 }]}
                placeholder="Cidade"
                placeholderTextColor={theme.colors.placeholder}
                value={form.city}
                onChangeText={(text) => setForm({ ...form, city: text })}
              />
            </View>

            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={styles.input}
              placeholder="Bairro"
              placeholderTextColor={theme.colors.placeholder}
              value={form.neighborhood}
              onChangeText={(text) => setForm({ ...form, neighborhood: text })}
            />

            <Text style={styles.label}>Nome da rua</Text>
            <View style={styles.twoColumnRow}>
              <TextInput
                style={[styles.input, { flex: 2 }]}
                placeholder="Nome da rua"
                placeholderTextColor={theme.colors.placeholder}
                value={form.street}
                onChangeText={(text) => setForm({ ...form, street: text })}
              />
              <View style={{ width: 8 }} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Número"
                placeholderTextColor={theme.colors.placeholder}
                value={form.number}
                onChangeText={(text) => setForm({ ...form, number: text })}
                keyboardType="number-pad"
              />
            </View>

            <Text style={styles.label}>
              Complemento/Referências Próx./Descrição do Prédio
            </Text>
            <TextInput
              style={[styles.input, styles.complementInput]}
              placeholder="Complemento/Referências Próx./Descrição do Prédio"
              placeholderTextColor={theme.colors.placeholder}
              value={form.complement}
              onChangeText={(text) => setForm({ ...form, complement: text })}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />

            {/* ─── Opções de Endereço ─── */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Opções de endereço
            </Text>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>
                  Definir como endereço padrão
                </Text>
              </View>
              <Switch
                value={form.isDefaultAddress}
                onValueChange={(value) =>
                  setForm({ ...form, isDefaultAddress: value })
                }
                trackColor={{
                  false: theme.colors.gray_300,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>
                  Definir como endereço de coleta
                </Text>
              </View>
              <Switch
                value={form.isPickupAddress}
                onValueChange={(value) =>
                  setForm({ ...form, isPickupAddress: value })
                }
                trackColor={{
                  false: theme.colors.gray_300,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>
                  Definir como endereço de devolução
                </Text>
              </View>
              <Switch
                value={form.isReturnAddress}
                onValueChange={(value) =>
                  setForm({ ...form, isReturnAddress: value })
                }
                trackColor={{
                  false: theme.colors.gray_300,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.white}
              />
            </View>

            {/* ─── Salvar como ─── */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Salvar como:
            </Text>

            <View style={styles.addressTypeRow}>
              <TouchableOpacity
                style={[
                  styles.addressTypeButton,
                  form.addressType === "work" && styles.addressTypeButtonActive,
                ]}
                onPress={() => setForm({ ...form, addressType: "work" })}
              >
                <Text
                  style={[
                    styles.addressTypeButtonText,
                    form.addressType === "work" &&
                      styles.addressTypeButtonTextActive,
                  ]}
                >
                  Trabalho
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addressTypeButton,
                  form.addressType === "home" && styles.addressTypeButtonActive,
                ]}
                onPress={() => setForm({ ...form, addressType: "home" })}
              >
                <Text
                  style={[
                    styles.addressTypeButtonText,
                    form.addressType === "home" &&
                      styles.addressTypeButtonTextActive,
                  ]}
                >
                  Casa
                </Text>
              </TouchableOpacity>
            </View>

            {/* ─── Ações ─── */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAddress}
              disabled={isSaving}
            >
              <Text style={styles.deleteButtonText}>Excluir endereço</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "Salvando..." : "Salvar"}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PinModal
        visible={isPinModalOpen}
        onClose={onClosePinModal}
        draftGateCoords={draftGateCoords}
        onMapPressSetGate={onMapPressSetGate}
        onConfirmPin={onConfirmPin}
        isBuyer={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1 },
  containerScroll: { flex: 1, backgroundColor: theme.colors.background },
  formContent: { padding: 16 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.gray_600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 16,
  },

  label: {
    fontSize: 13,
    color: theme.colors.gray_600,
    marginBottom: 6,
    fontWeight: "500",
  },

  input: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.gray_800,
    marginBottom: 12,
    fontSize: 14,
  },

  complementInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },

  twoColumnRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  validateCepButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },

  validateCepButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },

  cepHelperText: {
    color: theme.colors.gray_500,
    fontSize: 12,
    marginBottom: 12,
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },

  toggleLabel: {
    fontSize: 14,
    color: theme.colors.gray_800,
    fontWeight: "500",
  },

  addressTypeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  addressTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.orange_500,
    alignItems: "center",
    justifyContent: "center",
  },

  addressTypeButtonActive: {
    borderColor: theme.colors.orange_500,
    backgroundColor: theme.colors.orange_500,
  },

  addressTypeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.orange_500,
  },

  addressTypeButtonTextActive: {
    color: theme.colors.white,
  },

  deleteButton: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.orange_500,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.orange_500,
  },

  saveButton: {
    backgroundColor: theme.colors.orange_500,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.white,
  },
});
