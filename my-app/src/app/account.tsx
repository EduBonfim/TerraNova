import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Platform, TextInput, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { addFarmPhoto, getFarmPhotos, removeFarmPhoto } from '../services/communityStore';


// 🎨 NOVA PALETA OFICIAL TERRA Nova
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
    orange_500: '#F9A825', // Estrelas de avaliação
    red_500: '#EF4444', 
  }
};

export default function AccountScreen() {
  const [farmPhotos, setFarmPhotos] = useState<string[]>(getFarmPhotos('Pedro Paulo'));
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const onAddPhoto = () => {
    const uri = newPhotoUrl.trim();
    if (!uri) {
      Alert.alert('Informe um link', 'Cole a URL da foto da sua fazenda para adicionar.');
      return;
    }
    const result = addFarmPhoto('Pedro Paulo', uri);
    if (!result.ok) {
      Alert.alert('Limite atingido', 'Você pode adicionar no máximo 5 fotos por perfil.');
      return;
    }
    setFarmPhotos(getFarmPhotos('Pedro Paulo'));
    setNewPhotoUrl('');
  };

  const onRemovePhoto = (uri: string) => {
    removeFarmPhoto('Pedro Paulo', uri);
    setFarmPhotos(getFarmPhotos('Pedro Paulo'));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* --- DADOS DO PRODUTOR E AVALIAÇÃO --- */}
        <View style={styles.profileSection}>
          <Image source={require('../assets/perfil.png')} style={styles.avatarLarge} />
          <Text style={styles.userName}>Pedro Paulo</Text>
          <Text style={styles.userRole}>Agricultor Familiar • Sítio Esperança</Text>
          
          {/* Estatísticas devolvidas (Essencial para a confiança na plataforma) */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.9</Text>
              <Text style={styles.statLabel}>
                <Ionicons name="star" size={12} color={theme.colors.orange_500} /> Avaliação
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Anúncios Ativos</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.galleryHeaderRow}>
            <Text style={styles.sectionTitle}>Fotos da Fazenda</Text>
            <Text style={styles.galleryCount}>{farmPhotos.length}/5</Text>
          </View>

          <TextInput
            style={styles.photoInput}
            placeholder="Cole a URL da foto da fazenda"
            placeholderTextColor={theme.colors.gray_500}
            value={newPhotoUrl}
            onChangeText={setNewPhotoUrl}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.addPhotoButton} onPress={onAddPhoto}>
            <Ionicons name="add-circle-outline" size={18} color={theme.colors.white} />
            <Text style={styles.addPhotoButtonText}>Adicionar foto</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
            {farmPhotos.map((uri) => (
              <View key={uri} style={styles.photoBox}>
                <TouchableOpacity onPress={() => setPreviewPhoto(uri)}>
                  <Image source={{ uri }} style={styles.farmPhoto} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => onRemovePhoto(uri)}>
                  <Ionicons name="close" size={12} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* --- BOTÕES DE AÇÃO DUPLOS (As duas vertentes do app) --- */}
        <View style={styles.actionButtonsContainer}>
          <Text style={styles.sectionTitle}>O que deseja anunciar?</Text>
          <View style={styles.buttonsRow}>
            
            {/* Botão de Economia Circular */}
            <TouchableOpacity 
              style={styles.primaryActionButton}
              onPress={() => router.push('/post')} // ADICIONE AQUI!
            >
              <Ionicons name="leaf" size={24} color={theme.colors.white} style={{ marginBottom: 4 }} />
              <Text style={styles.actionButtonText}>Insumo/Resíduo</Text>
            </TouchableOpacity>

            {/* Botão Plus (Colheita) */}
            <TouchableOpacity 
              style={[styles.primaryActionButton, { backgroundColor: theme.colors.orange_500 }]}
              onPress={() => router.push('/post')} // ADICIONE AQUI!
            >
              <Ionicons name="basket" size={24} color={theme.colors.white} style={{ marginBottom: 4 }} />
              <Text style={styles.actionButtonText}>Vender Produção</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* --- LISTAGEM DE ANÚNCIOS ATIVOS (Gerenciamento) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meus Anúncios</Text>
          
          <View style={styles.myAdCard}>
            <View style={styles.myAdIcon}><Ionicons name="leaf" size={24} color={theme.colors.primary} /></View>
            <View style={styles.myAdContent}>
              <Text style={styles.myAdTitle}>Esterco Bovino Curtido</Text>
              <Text style={styles.myAdSubtitle}>2 Toneladas • R$ 90,00/ton</Text>
            </View>
            <TouchableOpacity><Ionicons name="pencil" size={20} color={theme.colors.gray_500} /></TouchableOpacity>
          </View>

          <View style={styles.myAdCard}>
            <View style={styles.myAdIcon}><Ionicons name="basket" size={24} color={theme.colors.primary} /></View>
            <View style={styles.myAdContent}>
              <Text style={styles.myAdTitle}>Tomate Cereja Orgânico</Text>
              <Text style={styles.myAdSubtitle}>Caixa 15kg • R$ 110,00</Text>
            </View>
            <TouchableOpacity><Ionicons name="pencil" size={20} color={theme.colors.gray_500} /></TouchableOpacity>
          </View>
        </View>

        {/* --- DEFINIÇÕES E REGRAS --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Definições</Text>
          
          <TouchableOpacity style={styles.settingsRow}>
            <Ionicons name="document-text-outline" size={22} color={theme.colors.gray_800} />
            <Text style={styles.settingsText}>Meus Laudos de Solo</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray_500} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/certificates')}>
            <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.gray_800} />
            <Text style={styles.settingsText}>Certificados MAPA</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray_500} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/transport')}>
            <Ionicons name="car-outline" size={22} color={theme.colors.gray_800} />
            <Text style={styles.settingsText}>Regras de Transporte e Frete</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray_500} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/organic')}>
            <Ionicons name="leaf-outline" size={22} color={theme.colors.gray_800} />
            <Text style={styles.settingsText}>Seja Orgânico!</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray_500} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => router.replace('/')}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.red_500} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={Boolean(previewPhoto)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalClose} onPress={() => setPreviewPhoto(null)}>
            <Ionicons name="close" size={28} color={theme.colors.white} />
          </Pressable>
          {previewPhoto ? <Image source={{ uri: previewPhoto }} style={styles.fullImage} resizeMode="contain" /> : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { minHeight: 76, paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? 20 : 16, backgroundColor: theme.colors.primary, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_200, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.white },
  profileSection: { backgroundColor: theme.colors.white, alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_200 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  userName: { fontSize: 22, fontWeight: 'bold', color: theme.colors.gray_800 },
  userRole: { fontSize: 14, color: theme.colors.gray_500, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: 16, backgroundColor: theme.colors.background, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  statItem: { alignItems: 'center', paddingHorizontal: 16 },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: theme.colors.gray_800 },
  statLabel: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: theme.colors.gray_300 },
  actionButtonsContainer: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.gray_800, marginBottom: 12 },
  galleryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  galleryCount: { fontSize: 12, color: theme.colors.gray_500, fontWeight: 'bold' },
  photoInput: { backgroundColor: theme.colors.white, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.gray_300, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.gray_800, marginBottom: 10 },
  addPhotoButton: { backgroundColor: theme.colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 10 },
  addPhotoButtonText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 13 },
  galleryRow: { paddingRight: 10 },
  photoBox: { marginRight: 10, position: 'relative' },
  farmPhoto: { width: 110, height: 90, borderRadius: 10 },
  removePhotoButton: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  primaryActionButton: { flex: 1, backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, elevation: 2 },
  actionButtonText: { color: theme.colors.white, fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  myAdCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, padding: 16, borderRadius: 12, marginBottom: 10, elevation: 1 },
  myAdIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.lightGreen, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  myAdContent: { flex: 1 },
  myAdTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.gray_800 },
  myAdSubtitle: { fontSize: 13, color: theme.colors.gray_500, marginTop: 2 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, padding: 16, borderRadius: 12, marginBottom: 8 },
  settingsText: { flex: 1, fontSize: 15, color: theme.colors.gray_800, marginLeft: 12 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, marginTop: 10 },
  logoutText: { color: theme.colors.red_500, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: Platform.OS === 'android' ? 32 : 58, right: 18, zIndex: 2, padding: 6 },
  fullImage: { width: '94%', height: '82%' },
});