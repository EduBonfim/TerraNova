import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 🎨 TEMA OFICIAL TERRA NOVA
const theme = {
  colors: {
    primary: '#6B8E23',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    background: '#F9FAFB',
    gray_200: '#E5E7EB',
    gray_300: '#D1D5DB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
    orange_500: '#F59E0B',
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

export default function PostScreen() {
  const router = useRouter();
  
  // Estados do formulário
  const [tipo, setTipo] = useState<'insumo' | 'colheita'>('insumo');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [isDoacao, setIsDoacao] = useState(false);

  const publicarAnuncio = () => {
    // No futuro, aqui chamamos o backend (Spring Boot) para salvar no banco PostgreSQL
    alert('Anúncio publicado com sucesso no Terra Nova!');
    router.push('/profile'); // Redireciona para o Mercado após postar
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- CABEÇALHO --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.gray_800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Anúncio</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={CURRENT_PLATFORM_UI.keyboardBehavior}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* --- ÁREA DA FOTO --- */}
          <TouchableOpacity style={styles.photoUploadArea}>
            <Ionicons name="camera" size={40} color={theme.colors.gray_300} />
            <Text style={styles.photoUploadText}>Adicionar Foto do Produto</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            
            {/* --- SELETOR DE CATEGORIA --- */}
            <Text style={styles.label}>O que você quer anunciar?</Text>
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity 
                style={[styles.typeButton, tipo === 'insumo' && styles.typeButtonActive]}
                onPress={() => setTipo('insumo')}
              >
                <Ionicons name="leaf" size={20} color={tipo === 'insumo' ? theme.colors.white : theme.colors.gray_500} style={{ marginRight: 8 }} />
                <Text style={[styles.typeButtonText, tipo === 'insumo' && styles.typeButtonTextActive]}>
                  Insumo / Resíduo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.typeButton, tipo === 'colheita' && styles.typeButtonActiveOrange]}
                onPress={() => setTipo('colheita')}
              >
                <Ionicons name="basket" size={20} color={tipo === 'colheita' ? theme.colors.white : theme.colors.gray_500} style={{ marginRight: 8 }} />
                <Text style={[styles.typeButtonText, tipo === 'colheita' && styles.typeButtonTextActive]}>
                  Produção Orgânica
                </Text>
              </TouchableOpacity>
            </View>

            {/* --- CAMPOS DE TEXTO --- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título do Anúncio</Text>
              <TextInput 
                style={styles.input} 
                placeholder={tipo === 'insumo' ? "Ex: Cama de Frango, Palhada..." : "Ex: Tomate Cereja, Alface..."}
                placeholderTextColor="#6B7280"
                value={titulo}
                onChangeText={setTitulo}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Quantidade</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ex: 2 Ton, 15 kg"
                  placeholderTextColor="#6B7280"
                  value={quantidade}
                  onChangeText={setQuantidade}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Preço (R$)</Text>
                <TextInput 
                  style={[styles.input, isDoacao && styles.inputDisabled]} 
                  placeholder="0,00"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  value={preco}
                  onChangeText={setPreco}
                  editable={!isDoacao}
                />
              </View>
            </View>

            {/* --- OPÇÃO DE DOAÇÃO / TROCA --- */}
            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setIsDoacao(!isDoacao)}
            >
              <View style={[styles.checkbox, isDoacao && styles.checkboxActive]}>
                {isDoacao && <Ionicons name="checkmark" size={16} color={theme.colors.white} />}
              </View>
              <Text style={styles.checkboxLabel}>Disponibilizar para Doação ou Troca Solidária</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição e Detalhes</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Fale um pouco sobre a qualidade, como pode ser retirado, etc."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                value={descricao}
                onChangeText={setDescricao}
                textAlignVertical="top"
              />
            </View>

            {/* --- BOTÃO PUBLICAR --- */}
            <TouchableOpacity style={styles.publishButton} onPress={publicarAnuncio}>
              <Text style={styles.publishButtonText}>Publicar no Terra Nova</Text>
              <Ionicons name="paper-plane-outline" size={20} color={theme.colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 💅 ESTILOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: CURRENT_PLATFORM_UI.headerHeight, paddingHorizontal: 16, paddingBottom: CURRENT_PLATFORM_UI.headerPaddingBottom, paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_200, overflow: 'hidden' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.gray_800 },
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  
  // Foto
  photoUploadArea: { height: 160, backgroundColor: theme.colors.lightGreen, margin: 20, borderRadius: 16, borderWidth: 2, borderColor: theme.colors.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  photoUploadText: { marginTop: 12, color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 },

  // Formulário
  formContainer: { paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: theme.colors.gray_800, marginBottom: 8 },
  
  // Seletor
  typeSelectorRow: { flexDirection: 'row', marginBottom: 20 },
  typeButton: { flex: 1, flexDirection: 'row', paddingVertical: 12, backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.gray_300, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginHorizontal: 4 },
  typeButtonActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  typeButtonActiveOrange: { backgroundColor: theme.colors.orange_500, borderColor: theme.colors.orange_500 },
  typeButtonText: { fontSize: 14, fontWeight: 'bold', color: theme.colors.gray_500 },
  typeButtonTextActive: { color: theme.colors.white },

  // Inputs
  inputGroup: { marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.gray_300, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#111827' },
  inputDisabled: { backgroundColor: theme.colors.gray_200, color: '#374151' },
  textArea: { height: 100 },

  // Checkbox
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: theme.colors.white, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.gray_200 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: theme.colors.gray_300, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  checkboxLabel: { fontSize: 14, color: theme.colors.gray_800, flex: 1, fontWeight: '500' },

  // Botão
  publishButton: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 2 },
  publishButtonText: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold' },
});