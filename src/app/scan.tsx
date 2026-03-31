import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  StatusBar,
  TextInput,
  ScrollView,
  KeyboardAvoidingView
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
    background: '#F5F5F5',
    gray_200: '#E5E7EB',
    gray_300: '#D1D5DB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
    orange_500: '#F9A825',
    red_500: '#EF4444',
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

export default function ScanScreen() {
  const router = useRouter();
  
  // Controle de estado: 0 = Upload, 1 = IA Lendo, 2 = Confirmação Humana, 3 = Resultado Final
  const [etapa, setEtapa] = useState<0 | 1 | 2 | 3>(0);

  // Estados dos campos de um Laudo de Solo Completo (Pré-preenchidos pela "IA")
  const [ph, setPh] = useState('5.2');
  const [materiaOrganica, setMateriaOrganica] = useState('1.5');
  const [fosforo, setFosforo] = useState('12.0');
  const [potassio, setPotassio] = useState('45.0');
  const [calcio, setCalcio] = useState('1.5');
  const [magnesio, setMagnesio] = useState('0.8');
  const [aluminio, setAluminio] = useState('0.3');
  const [ctc, setCtc] = useState('6.2');
  const [vBase, setVBase] = useState('45.0');

  // Simula o tempo de OCR / Extração da API
  const simularAnaliseIA = () => {
    setEtapa(1);
    setTimeout(() => {
      setEtapa(2);
    }, 3500); 
  };

  const confirmarDados = () => {
    setEtapa(3);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Análise Inteligente</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={CURRENT_PLATFORM_UI.keyboardBehavior}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* --- ETAPA 0: TELA DE UPLOAD --- */}
          {etapa === 0 && (
            <View style={styles.centerContent}>
              <Ionicons name="document-text" size={80} color={theme.colors.gray_300} style={styles.iconMain} />
              <Text style={styles.title}>Envie o seu Laudo</Text>
              <Text style={styles.subtitle}>
                Tire uma foto ou envie o PDF da sua última análise de solo. A Inteligência Artificial Terra Nova vai extrair todos os dados automaticamente.
              </Text>

              <TouchableOpacity style={styles.uploadButton} onPress={simularAnaliseIA}>
                <Ionicons name="camera-outline" size={24} color={theme.colors.white} style={{ marginRight: 10 }} />
                <Text style={styles.uploadButtonText}>Tirar Foto do Laudo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="folder-open-outline" size={20} color={theme.colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.secondaryButtonText}>Escolher Arquivo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* --- ETAPA 1: SIMULAÇÃO DE IA TRABALHANDO --- */}
          {etapa === 1 && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ transform: [{ scale: 1.5 }], marginBottom: 24 }} />
              <Text style={styles.title}>A extrair dados...</Text>
              <Text style={styles.subtitle}>
                A ler os níveis de macro e micronutrientes do seu documento através de visão computacional.
              </Text>
            </View>
          )}

          {/* --- ETAPA 2: REVISÃO HUMANA (LAUDO COMPLETO) --- */}
          {etapa === 2 && (
            <View style={styles.formContent}>
              
              {/* O Aviso Solicitado */}
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={24} color={theme.colors.orange_500} />
                <Text style={styles.warningBoxText}>
                  A Leitura dos dados pode estar incorreta, verifique todos os campos antes de confirmar o seu laudo.
                </Text>
              </View>

              <Text style={styles.formTitle}>Dados Extraídos</Text>

              {/* Bloco 1: Características Químicas Básicas */}
              <View style={styles.formSectionBox}>
                <Text style={styles.sectionLabel}>Parâmetros Básicos</Text>
                
                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>pH (H2O)</Text>
                    <TextInput style={styles.input} value={ph} onChangeText={setPh} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>M.O. (%)</Text>
                    <TextInput style={styles.input} value={materiaOrganica} onChangeText={setMateriaOrganica} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>CTC (cmolc/dm³)</Text>
                    <TextInput style={styles.input} value={ctc} onChangeText={setCtc} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>V (%)</Text>
                    <TextInput style={styles.input} value={vBase} onChangeText={setVBase} keyboardType="numeric" />
                  </View>
                </View>
              </View>

              {/* Bloco 2: Macronutrientes */}
              <View style={styles.formSectionBox}>
                <Text style={styles.sectionLabel}>Macronutrientes Primários e Secundários</Text>
                
                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Fósforo - P</Text>
                    <TextInput style={styles.input} value={fosforo} onChangeText={setFosforo} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Potássio - K</Text>
                    <TextInput style={styles.input} value={potassio} onChangeText={setPotassio} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Cálcio - Ca</Text>
                    <TextInput style={styles.input} value={calcio} onChangeText={setCalcio} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Magnésio - Mg</Text>
                    <TextInput style={styles.input} value={magnesio} onChangeText={setMagnesio} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Alumínio - Al (Tóxico)</Text>
                  <TextInput style={styles.input} value={aluminio} onChangeText={setAluminio} keyboardType="numeric" />
                </View>
              </View>

              <TouchableOpacity style={styles.confirmButton} onPress={confirmarDados}>
                <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.confirmButtonText}>Confirmar e Gerar Diagnóstico</Text>
              </TouchableOpacity>
              
              <View style={{ height: 30 }} />
            </View>
          )}

          {/* --- ETAPA 3: RESULTADO E MATCH --- */}
          {etapa === 3 && (
            <View style={styles.centerContent}>
              <View style={styles.successIconCircle}>
                <Ionicons name="analytics" size={40} color={theme.colors.white} />
              </View>
              <Text style={styles.title}>Diagnóstico Pronto!</Text>
              
              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>Problemas Identificados:</Text>
                
                <View style={styles.resultItem}>
                  <Ionicons name="warning-outline" size={20} color={theme.colors.orange_500} />
                  <Text style={styles.resultText}>Deficiência de <Text style={{fontWeight: 'bold'}}>Fósforo (P)</Text></Text>
                </View>
                
                <View style={styles.resultItem}>
                  <Ionicons name="warning-outline" size={20} color={theme.colors.orange_500} />
                  <Text style={styles.resultText}>Baixa <Text style={{fontWeight: 'bold'}}>Matéria Orgânica</Text></Text>
                </View>

                <View style={styles.divider} />
                
                <Text style={styles.recommendationTitle}>Ação Recomendada:</Text>
                <Text style={styles.recommendationText}>
                  Aplicação imediata de Cama de Frango ou Composto Orgânico Curtido para correção sustentável.
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.matchButton} 
                onPress={() => router.push('/map')} 
              >
                <Ionicons name="save-outline" size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.matchButtonText}>Salvar Laudo e Buscar Insumos</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 💅 ESTILOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: CURRENT_PLATFORM_UI.headerHeight, paddingHorizontal: 16, paddingBottom: CURRENT_PLATFORM_UI.headerPaddingBottom, paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop, backgroundColor: theme.colors.primary, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_200, overflow: 'hidden' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1 },
  
  // Layouts
  centerContent: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  formContent: { flex: 1, padding: 16 },
  
  iconMain: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.gray_800, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: theme.colors.gray_500, textAlign: 'center', lineHeight: 24, marginBottom: 40, paddingHorizontal: 10 },
  
  // Botões Etapa 0
  uploadButton: { flexDirection: 'row', backgroundColor: theme.colors.primary, width: '100%', paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 2 },
  uploadButtonText: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { flexDirection: 'row', backgroundColor: theme.colors.lightGreen, width: '100%', paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  secondaryButtonText: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' },
  
  // Formulário Etapa 2
  warningBox: { flexDirection: 'row', backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderLeftWidth: 4, borderLeftColor: theme.colors.orange_500 },
  warningBoxText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#B45309', lineHeight: 20, fontWeight: '500' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.gray_800, marginBottom: 16 },
  
  formSectionBox: { backgroundColor: theme.colors.white, padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.gray_200 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 16, textTransform: 'uppercase' },
  
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  inputCol: { width: '48%' },
  inputGroup: { marginBottom: 12 },
  
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: theme.colors.gray_500, marginBottom: 6 },
  input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.gray_300, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: theme.colors.gray_800 },
  
  confirmButton: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 2 },
  confirmButtonText: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold' },

  // Resultado Etapa 3
  successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  resultCard: { backgroundColor: theme.colors.white, width: '100%', padding: 20, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 30 },
  resultCardTitle: { fontSize: 14, color: theme.colors.gray_500, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 16 },
  resultItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  resultText: { fontSize: 16, color: theme.colors.gray_800, marginLeft: 12 },
  divider: { height: 1, backgroundColor: theme.colors.gray_200, marginVertical: 16 },
  recommendationTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8 },
  recommendationText: { fontSize: 15, color: theme.colors.gray_800, lineHeight: 22 },
  matchButton: { flexDirection: 'row', backgroundColor: theme.colors.orange_500, width: '100%', paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  matchButtonText: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold' },
});