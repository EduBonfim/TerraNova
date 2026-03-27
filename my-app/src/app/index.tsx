import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Platform,
  Image
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
  footerPaddingBottom: 20,
};

const ANDROID_VISUAL = {
  footerPaddingBottom: 0,
};

const CURRENT_PLATFORM_UI = Platform.OS === 'ios' ? IOS_VISUAL : ANDROID_VISUAL;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.content}>
          {/* --- LOGO E TÍTULO --- */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image source={require('../assets/mascote.png')} style={styles.avatar}/>
            </View>
            <Text style={styles.title}>Seja bem-vindo à Terra Nova</Text>
          </View>

          {/* --- DESCRIÇÃO DO APLICATIVO --- */}
          <Text style={styles.description}>
            A primeira plataforma dedicada à transição agroecológica. 
            Conectamos agricultores para impulsionar a economia circular, 
            facilitamos a venda de bioinsumos e utilizamos Inteligência Artificial 
            para analisar a saúde do seu solo.
          </Text>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons name="scan-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.featureText}>IA para Leitura de Laudos</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="map-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.featureText}>Radar de Insumos num raio de 15km</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.featureText}>Apoio à Certificação Orgânica</Text>
            </View>
          </View>
        </View>

        {/* --- BOTÕES DE ACESSO --- */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.push('/login')}
          >
            <Text style={styles.primaryButtonText}>Fazer Login</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push('/register')}
          >
            <Text style={styles.secondaryButtonText}>Criar nova conta</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

// 💅 ESTILOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, justifyContent: 'space-between', padding: 24 },
  
  content: { flex: 1, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 4 },
  avatar: { width: 160, height: 160, borderRadius: 50 },
  title: { fontSize: 36, fontWeight: 'bold', color: theme.colors.primary, textAlign: 'center' },
  
  description: { fontSize: 16, color: theme.colors.gray_500, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  
  features: { backgroundColor: theme.colors.background, padding: 20, borderRadius: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { fontSize: 15, color: theme.colors.gray_800, marginLeft: 12, fontWeight: '500' },

  footer: { paddingBottom: CURRENT_PLATFORM_UI.footerPaddingBottom },
  primaryButton: { backgroundColor: theme.colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 2 },
  primaryButtonText: { color: theme.colors.white, fontSize: 18, fontWeight: 'bold' },
  
  secondaryButton: { backgroundColor: theme.colors.lightGreen, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  secondaryButtonText: { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold' },
});