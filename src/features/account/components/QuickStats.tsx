import { appTheme as theme } from '@/theme/appTheme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickStatsProps {
  rating: number;
  completeness: number;
  onPressRating: () => void;
}

export function QuickStats({ rating, completeness, onPressRating }: QuickStatsProps) {
  return (
    <View style={styles.statsQuickRow}>
      <TouchableOpacity
        style={styles.quickStatItem}
        onPress={onPressRating}
      >
        <Text style={styles.quickStatNumber}>{rating.toFixed(1)}</Text>
        <Text style={styles.quickStatLabel}>
          <Ionicons name="star" size={11} color={theme.colors.orange_500} /> Avaliação
        </Text>
      </TouchableOpacity>
      <View style={styles.quickStatDivider} />
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatNumber}>{completeness}%</Text>
        <Text style={styles.quickStatLabel}>Completo</Text>
      </View>
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
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.gray_800,
  },
  quickStatLabel: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: theme.colors.gray_200,
  },
});
