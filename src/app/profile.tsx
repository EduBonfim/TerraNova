import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Platform, Image, Modal, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAverageRating, getReviews } from '../services/communityStore';

// 🎨 NOVA PALETA OFICIAL TERRA Nova
const theme = {
  colors: {
    primary: '#6B8E23',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    background: '#F5F5F5',
    gray_300: '#D1D5DB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
    gray_900: '#111827',
    orange_500: '#F9A825',
  }
};

const IOS_VISUAL = {
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 16,
  modalCloseTop: 58,
};

const ANDROID_VISUAL = {
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 20,
  modalCloseTop: 32,
};

const CURRENT_PLATFORM_UI = Platform.OS === 'ios' ? IOS_VISUAL : ANDROID_VISUAL;

// 📦 DADOS DO MARKETPLACE (Bioinsumos + Escoamento de Produção)
const OPORTUNIDADES = [
  { id: '1', produto: 'Cama de Frango - Tonelada', vendedor: 'Fazenda São João', preco: 'R$ 150,00', estoque: '12 toneladas disponíveis', icone: 'leaf', foto: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80' },
  { id: '2', produto: 'Esterco Bovino Curtido - Ton', vendedor: 'Sítio Esperança', preco: 'R$ 90,00', estoque: '2 toneladas Curtido', icone: 'leaf-outline', foto: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80' },
  { id: '3', produto: 'Composto Orgânico Premium - 50kg', vendedor: 'Central Compostagem Comunitária', preco: 'R$ 45,00', estoque: 'Retirada imediata', icone: 'flask', foto: 'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80' },
  { id: '4', produto: 'Tomate Cereja Orgânico - 15kg', vendedor: 'Sítio Esperança', preco: 'R$ 110,00', estoque: 'Selo Orgânico MAPA', icone: 'basket', foto: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80' },
];

export default function MarketplaceScreen() {
  const router = useRouter();
  const [imageModalUri, setImageModalUri] = useState<string | null>(null);
  const ratingBySeller = useMemo(() => {
    const result: Record<string, { avg: number; total: number }> = {};
    OPORTUNIDADES.forEach((item) => {
      const avg = getAverageRating(item.vendedor);
      const total = getReviews(item.vendedor).length;
      result[item.vendedor] = { avg, total };
    });
    return result;
  }, []);
  
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setImageModalUri(item.foto)}>
        <Image source={{ uri: item.foto }} style={styles.itemImage} />
      </TouchableOpacity>

      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icone} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.produtoTitle}>{item.produto}</Text>
          <Text style={styles.vendedorText}>
            <Ionicons name="location-outline" size={14} color={theme.colors.gray_500} /> {item.vendedor}
          </Text>
          <Text style={styles.ratingText}>
            <Ionicons name="star" size={13} color={theme.colors.orange_500} /> {ratingBySeller[item.vendedor]?.avg || 0} ({ratingBySeller[item.vendedor]?.total || 0} avaliações)
          </Text>
        </View>
      </View>
      
      <View style={styles.divisor} />
      
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.precoText}>{item.preco}</Text>
          <Text style={styles.estoqueText}>{item.estoque}</Text>
        </View>
        <TouchableOpacity style={styles.buyButton} onPress={() => router.push('/messages')}>
          <Text style={styles.buyButtonText}>Negociar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/home')}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Mercado Terra Nova</Text>
          <Text style={styles.headerSubtitle}>Economia circular e venda direta</Text>
        </View>
      </View>

      <FlatList
        data={OPORTUNIDADES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={Boolean(imageModalUri)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalClose} onPress={() => setImageModalUri(null)}>
            <Ionicons name="close" size={28} color={theme.colors.white} />
          </Pressable>
          {imageModalUri ? <Image source={{ uri: imageModalUri }} style={styles.fullImage} resizeMode="contain" /> : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primary },
  list: { flex: 1, backgroundColor: theme.colors.background },
  header: { height: CURRENT_PLATFORM_UI.headerHeight, paddingHorizontal: 16, paddingBottom: CURRENT_PLATFORM_UI.headerPaddingBottom, paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop, backgroundColor: theme.colors.primary, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_300, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  backButton: { marginRight: 10, padding: 4 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.white },
  headerSubtitle: { fontSize: 14, color: theme.colors.white, marginTop: 4 },
  listContainer: { padding: 15 },
  card: { backgroundColor: theme.colors.white, borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  itemImage: { width: '100%', height: 160, borderRadius: 10, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.lightGreen, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerText: { flex: 1 },
  produtoTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.gray_900, marginBottom: 4 },
  vendedorText: { fontSize: 13, color: theme.colors.gray_500 },
  ratingText: { fontSize: 12, color: theme.colors.gray_800, marginTop: 4 },
  divisor: { height: 1, backgroundColor: theme.colors.gray_300, marginVertical: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  precoText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
  estoqueText: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  buyButton: { backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buyButtonText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: CURRENT_PLATFORM_UI.modalCloseTop, right: 18, zIndex: 2, padding: 6 },
  fullImage: { width: '94%', height: '82%' },
});