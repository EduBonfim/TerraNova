import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 🎨 PALETA OFICIAL TERRA NOVA
const theme = {
  colors: {
    primary: '#6B8E23', 
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    background: '#F5F5F5',
    gray_200: '#E5E7EB',
    gray_300: '#D1D5DB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
    orange_500: '#F9A825',
  }
};

const IOS_VISUAL = {
  keyboardBehavior: 'padding' as const,
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 16,
};

const ANDROID_VISUAL = {
  keyboardBehavior: undefined,
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 20,
};

const CURRENT_PLATFORM_UI = Platform.OS === 'ios' ? IOS_VISUAL : ANDROID_VISUAL;

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.gray_800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Conta</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={CURRENT_PLATFORM_UI.keyboardBehavior}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.pageTitle}>Junte-se ao Terra Nova</Text>
          <Text style={styles.pageSubtitle}>Preencha os seus dados para aceder ao mapa e ao mercado agroecológico.</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Ex: Pedro Paulo" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Propriedade (Opcional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="home-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Ex: Sítio Esperança" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail ou CPF</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Para o seu login" keyboardType="email-address" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Criar Senha</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray_500} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Mínimo de 6 caracteres" secureTextEntry={true} />
              </View>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={() => router.replace('/home')}>
              <Text style={styles.registerButtonText}>Concluir Cadastro</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: CURRENT_PLATFORM_UI.headerHeight, paddingHorizontal: 16, paddingBottom: CURRENT_PLATFORM_UI.headerPaddingBottom, paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_200, overflow: 'hidden' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.gray_800 },
  
  scrollContent: { padding: 24, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: theme.colors.gray_500, marginBottom: 32, lineHeight: 22 },

  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: theme.colors.gray_800, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.gray_300, borderRadius: 12, paddingHorizontal: 12, height: 56 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: theme.colors.gray_800 },

  registerButton: { flexDirection: 'row', backgroundColor: theme.colors.orange_500, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 12, elevation: 2 },
  registerButtonText: { color: theme.colors.white, fontSize: 18, fontWeight: 'bold' },
});