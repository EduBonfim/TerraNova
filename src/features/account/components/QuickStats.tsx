import { appTheme as theme } from '@/theme/appTheme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickStatsProps {
  rating: number;
  completeness: number;
  onPressRating: () => void;
  onPressCompleteness: () => void;
}

export function QuickStats({ rating, completeness, onPressRating, onPressCompleteness }: QuickStatsProps) {
  return (
    <View style={styles.statsQuickRow}>
      <TouchableOpacity
        style={styles.quickStatItem}
        onPress={onPressRating}
      >
        <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
        <Text style={styles.ratingLabel}>
          <Ionicons name="star" size={18} color={theme.colors.orange_500} /> Avaliação
        </Text>
      </TouchableOpacity>
      <View style={styles.quickStatDivider} />
      <TouchableOpacity
        style={styles.quickStatItem}
        onPress={onPressCompleteness}
      >
        <Text style={styles.quickStatLabel}>Seu perfil está</Text>
        <Text style={styles.quickStatNumber}>{completeness}%</Text>
        <Text style={styles.quickStatLabel}>completo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  statsQuickRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray_800,
  },
  quickStatLabel: {
    fontSize: 13,
    color: theme.colors.gray_500,
    marginTop: 2,
    textAlign: 'center',
  },
  ratingNumber: {
    fontSize: 28, // Tamanho do valor (ex: 4.8)
    fontWeight: 'bold',
    color: theme.colors.gray_800,
  },
  ratingLabel: {
    fontSize: 13, // Tamanho do texto "Avaliação"
    color: theme.colors.gray_500,
    marginTop: 4,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: theme.colors.gray_200,
  },
});
