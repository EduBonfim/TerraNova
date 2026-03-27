import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity,  Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 🎨 NOVA PALETA OFICIAL TERRA NOVA
const theme = {
  colors: {
    primary: '#6B8E23',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    background: '#F5F5F5',
    gray_200: '#E5E7EB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
    orange_500: '#F9A825',
  }
};

const IOS_VISUAL = {
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 16,
};

const ANDROID_VISUAL = {
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 20,
};

const CURRENT_PLATFORM_UI = Platform.OS === 'ios' ? IOS_VISUAL : ANDROID_VISUAL;

const PASSOS_CERTIFICACAO = [
  { 
    id: 1, 
    titulo: 'Adequação da Propriedade', 
    icone: 'leaf-outline', 
    descricao: 'A transição exige a suspensão total de agrotóxicos e adubos químicos solúveis. O solo deve ser tratado com compostagem, adubação verde e controlo biológico.' 
  },
  { 
    id: 2, 
    titulo: 'Escolha a Certificação', 
    icone: 'git-network-outline', 
    descricao: 'O MAPA oferece 3 caminhos: Auditoria por empresa, SPG (Sistema Participativo com outros produtores) ou OCS (Controlo Social para venda direta).' 
  },
  { 
    id: 3, 
    titulo: 'Plano de Manejo Orgânico', 
    icone: 'document-text-outline', 
    descricao: 'Terá de documentar tudo no caderno de campo: sementes utilizadas, controlo da água e a origem do esterco e bioinsumos adquiridos.' 
  },
  { 
    id: 4, 
    titulo: 'Auditoria e Emissão do Selo', 
    icone: 'checkmark-circle-outline', 
    descricao: 'Após a vistoria, entra para o Cadastro Nacional e recebe o direito de usar o selo SisOrg, agregando valor à sua colheita.' 
  }
];

export default function OrganicScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/account')}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <Ionicons name="shield-checkmark" size={24} color={theme.colors.white} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Trilha Orgânica</Text>
          <Text style={styles.headerSubtitle}>Guia Oficial SisOrg / MAPA</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Valorize a sua Colheita</Text>
          <Text style={styles.bannerText}>
            Produtos com selo orgânico têm maior valor agregado. O Terra Nova ajuda a encontrar os insumos naturais necessários para esta transição. Siga os passos:
          </Text>
        </View>

        <View style={styles.timelineContainer}>
          {PASSOS_CERTIFICACAO.map((passo, index) => (
            <View key={passo.id} style={styles.stepRow}>
              
              <View style={styles.stepGraphic}>
                <View style={styles.iconCircle}>
                  <Ionicons name={passo.icone as any} size={24} color={theme.colors.white} />
                </View>
                {index !== PASSOS_CERTIFICACAO.length - 1 && (
                  <View style={styles.connectorLine} />
                )}
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepNumber}>Passo {passo.id}</Text>
                <Text style={styles.stepTitle}>{passo.titulo}</Text>
                <Text style={styles.stepDescription}>{passo.descricao}</Text>
              </View>
              
            </View>
          ))}
        </View>

        <View style={styles.actionContainer}>
          <Text style={styles.actionText}>
            Precisa de ajuda com a documentação? A comunidade Terra Nova possui consultores agronómicos disponíveis.
          </Text>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="download-outline" size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Baixar Cartilha do MAPA</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ESTILOS MANTIDOS INTACTOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: CURRENT_PLATFORM_UI.headerHeight,
    paddingHorizontal: 16,
    paddingBottom: CURRENT_PLATFORM_UI.headerPaddingBottom,
    paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop, 
    backgroundColor: theme.colors.primary, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.gray_200,
    overflow: 'hidden',
  },
  backButton: { marginRight: 10, padding: 4 },
  headerTextContainer: { marginLeft: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.white },
  headerSubtitle: { fontSize: 14, color: theme.colors.white },
  banner: { 
    margin: 20, 
    padding: 20, 
    backgroundColor: theme.colors.lightGreen, 
    borderRadius: 12, 
    borderLeftWidth: 4, 
    borderLeftColor: theme.colors.primary 
  },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8 },
  bannerText: { fontSize: 14, color: theme.colors.primary, lineHeight: 22 },
  timelineContainer: { paddingHorizontal: 20, paddingTop: 10 },
  stepRow: { flexDirection: 'row' },
  stepGraphic: { alignItems: 'center', width: 40, marginRight: 16 },
  iconCircle: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: theme.colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 2 
  },
  connectorLine: { 
    width: 2, 
    flex: 1, 
    backgroundColor: theme.colors.primary, 
    opacity: 0.3, 
    marginTop: -5, 
    marginBottom: -5, 
    zIndex: 1, 
    minHeight: 50 
  },
  stepContent: { flex: 1, paddingBottom: 30 },
  stepNumber: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: theme.colors.orange_500, 
    textTransform: 'uppercase', 
    marginBottom: 4 
  },
  stepTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.gray_800, marginBottom: 8 },
  stepDescription: { fontSize: 14, color: theme.colors.gray_500, lineHeight: 22 },
  actionContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  actionText: {
    fontSize: 14,
    color: theme.colors.gray_800,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});