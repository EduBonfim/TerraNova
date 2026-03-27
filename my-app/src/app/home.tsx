import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 🎨 NOVA PALETA OFICIAL TERRA NOVA (Inspirada no Protótipo)
const theme = {
  colors: {
    primary: '#6B8E23', // Verde Vibrante Terra Nova
    lightGreen: '#E8F5E9', // Fundo Suave
    white: '#FFFFFF',
    background: '#F5F5F5',
    gray_200: '#E5E7EB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
    gray_900: '#111827',
    orange_500: '#F9A825', // Destaque/Alerta - Amarelo/Ouro
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

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- CABEÇALHO DO USUÁRIO --- */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={require('../assets/perfil.png')} style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Olá, Pedro Paulo</Text>
              <Text style={styles.location}>
                <Ionicons name="location" size={12} color={theme.colors.primary} /> Rio Verde, GO
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.gray_900} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* --- RADAR (Alertas de Proximidade) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Radar Terra Nova</Text>
          
          <TouchableOpacity style={styles.alertCard} onPress={() => router.push('/map')}>
            <View style={[styles.alertIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="leaf" size={20} color={theme.colors.orange_500} />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Novo bioinsumo próximo!</Text>
              <Text style={styles.alertDesc}>Cama de frango disponível a apenas 5km.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray_500} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.alertCard} onPress={() => router.push('/profile')}>
            <View style={[styles.alertIcon, { backgroundColor: theme.colors.lightGreen }]}>
              <Ionicons name="storefront" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Produtores Estão Vendendo</Text>
              <Text style={styles.alertDesc}>3 vizinhos anunciaram colheitas orgânicas.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray_500} />
          </TouchableOpacity>
        </View>

        {/* --- AÇÕES RÁPIDAS (Ícones Atualizados) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/post')} 
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="add-circle" size={30} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Postar Insumo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/scan')}>
              <View style={styles.actionIconCircle}>
                <Ionicons name="scan" size={30} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Análise de Solo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/profile')}>
              <View style={styles.actionIconCircle}>
                <Ionicons name="basket" size={30} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Vender Colheita</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* --- NOTÍCIAS DO AGRO --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notícias e Destaques</Text>
          
          <TouchableOpacity style={styles.newsCard}>
            <View style={styles.newsImagePlaceholder}>
              <Ionicons name="newspaper-outline" size={32} color={theme.colors.gray_500} />
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>Compostagem Orgânica: Reduza custos em até 40%</Text>
              <Text style={styles.newsSource}>Jornal do Campo • Hoje</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.newsCard}>
            <View style={styles.newsImagePlaceholder}>
              <Ionicons name="earth" size={32} color={theme.colors.gray_500} />
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>Novos incentivos para a transição agroecológica</Text>
              <Text style={styles.newsSource}>AgroNews • Ontem</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ESTILOS ATUALIZADOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { paddingBottom: 12 },
  
  // Header (Limpo e profissional)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: theme.colors.white },
  location: { fontSize: 14, color: theme.colors.white, marginTop: 2 },
  notificationIcon: { padding: 8, position: 'relative' },
  notificationBadge: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', borderWidth: 2, borderColor: theme.colors.primary },

  // Seções
  section: { padding: 18, paddingBottom: 0 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 12 },

  // Cards Radar
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  alertIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  alertTextContainer: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.gray_900 },
  alertDesc: { fontSize: 13, color: theme.colors.gray_500, marginTop: 2 },

  // Ações Rápidas
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { alignItems: 'center', width: '30%' },
  actionIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  actionText: { fontSize: 12, color: theme.colors.gray_900, textAlign: 'center', fontWeight: '500' },

  // Notícias
  newsCard: { flexDirection: 'row', backgroundColor: theme.colors.white, borderRadius: 12, overflow: 'hidden', marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  newsImagePlaceholder: { width: 100, backgroundColor: theme.colors.gray_200, justifyContent: 'center', alignItems: 'center' },
  newsContent: { flex: 1, padding: 12 },
  newsTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.gray_900, marginBottom: 8, lineHeight: 20 },
  newsSource: { fontSize: 12, color: theme.colors.gray_500 },
});