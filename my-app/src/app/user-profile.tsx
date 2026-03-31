import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAverageRating, getProfile, getReviews } from '../services/communityStore';

const theme = {
  colors: {
    primary: '#6B8E23',
    white: '#FFFFFF',
    background: '#F5F5F5',
    gray_200: '#E5E7EB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
    gray_900: '#111827',
    orange_500: '#F9A825',
  },
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

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const name = params.name || 'Fazenda São João';

  const profile = getProfile(name);
  const rating = getAverageRating(name);
  const reviews = getReviews(name);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/messages')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{profile.displayName}</Text>
          <Text style={styles.headerSubtitle}>Perfil público para negociação</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.bioText}>{profile.bio}</Text>
          <Text style={styles.ratingText}>
            <Ionicons name="star" size={14} color={theme.colors.orange_500} /> {rating} ({reviews.length} avaliações)
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fotos da fazenda</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {profile.farmPhotos.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.photo} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Itens para venda/doação</Text>
          {profile.listings.length === 0 ? <Text style={styles.emptyText}>Sem itens cadastrados.</Text> : null}
          {profile.listings.map((item) => (
            <View key={item.id} style={styles.rowItem}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.badge}>{item.type === 'venda' ? item.price || 'Venda' : 'Doação'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Estercagem / insumos</Text>
          {profile.insumos.length === 0 ? <Text style={styles.emptyText}>Sem insumos cadastrados.</Text> : null}
          {profile.insumos.map((item) => (
            <View key={item.id} style={styles.rowItem}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.amount}>{item.amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Avaliações recentes</Text>
          {reviews.length === 0 ? <Text style={styles.emptyText}>Ainda sem avaliações.</Text> : null}
          {reviews.slice(0, 5).map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <Text style={styles.reviewMeta}>{review.author} • {review.date}</Text>
              <Text style={styles.reviewStars}>{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.white },
  headerSubtitle: { fontSize: 13, color: theme.colors.white, marginTop: 2 },

  card: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.gray_900, marginBottom: 8 },
  bioText: { fontSize: 14, color: theme.colors.gray_800, lineHeight: 20 },
  ratingText: { fontSize: 13, color: theme.colors.gray_800, marginTop: 8 },
  photo: { width: 120, height: 90, borderRadius: 10, marginRight: 8 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  itemTitle: { color: theme.colors.gray_800, fontSize: 14, flex: 1, marginRight: 8 },
  badge: { color: theme.colors.white, backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold' },
  amount: { color: theme.colors.gray_500, fontSize: 12, fontWeight: 'bold' },
  emptyText: { color: theme.colors.gray_500, fontSize: 13 },
  reviewItem: { borderTopWidth: 1, borderTopColor: theme.colors.gray_200, paddingTop: 8, marginTop: 6 },
  reviewMeta: { fontSize: 11, color: theme.colors.gray_500 },
  reviewStars: { fontSize: 12, color: theme.colors.orange_500, marginTop: 2 },
  reviewComment: { fontSize: 13, color: theme.colors.gray_800, marginTop: 2 },
});
