import { appTheme as theme } from '@/theme/appTheme';
import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RatingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RatingsModal({ visible, onClose }: RatingsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.ratingsModalBackdrop}>
        <View style={styles.ratingsModalCard}>
          <View style={styles.ratingsModalHeader}>
            <Text style={styles.ratingsModalTitle}>Minhas Avaliações</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.gray_800} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.ratingsSummary}>
              <Text style={styles.ratingsSummaryNumber}>4.9</Text>
              <View style={styles.ratingsStars}>
                <Ionicons name="star" size={16} color={theme.colors.orange_500} />
                <Ionicons name="star" size={16} color={theme.colors.orange_500} />
                <Ionicons name="star" size={16} color={theme.colors.orange_500} />
                <Ionicons name="star" size={16} color={theme.colors.orange_500} />
                <Ionicons name="star-half" size={16} color={theme.colors.orange_500} />
              </View>
              <Text style={styles.ratingsCount}>baseado em 47 avaliações</Text>
            </View>

            <View style={styles.ratingsBreakdown}>
              <View style={styles.ratingBar}>
                <Text style={styles.ratingLabel}>5 estrelas</Text>
                <View style={styles.ratingBarContainer}>
                  <View style={[styles.ratingBarFill, { width: "85%", backgroundColor: "#10B981" }]} />
                </View>
                <Text style={styles.ratingCount}>40</Text>
              </View>
              <View style={styles.ratingBar}>
                <Text style={styles.ratingLabel}>4 estrelas</Text>
                <View style={styles.ratingBarContainer}>
                  <View style={[styles.ratingBarFill, { width: "12%", backgroundColor: "#F59E0B" }]} />
                </View>
                <Text style={styles.ratingCount}>5</Text>
              </View>
              <View style={styles.ratingBar}>
                <Text style={styles.ratingLabel}>3 estrelas</Text>
                <View style={styles.ratingBarContainer}>
                  <View style={[styles.ratingBarFill, { width: "2%", backgroundColor: "#EF4444" }]} />
                </View>
                <Text style={styles.ratingCount}>1</Text>
              </View>
              <View style={styles.ratingBar}>
                <Text style={styles.ratingLabel}>2 estrelas</Text>
                <View style={styles.ratingBarContainer}>
                  <View style={[styles.ratingBarFill, { width: "0%", backgroundColor: "#EF4444" }]} />
                </View>
                <Text style={styles.ratingCount}>0</Text>
              </View>
              <View style={styles.ratingBar}>
                <Text style={styles.ratingLabel}>1 estrela</Text>
                <View style={styles.ratingBarContainer}>
                  <View style={[styles.ratingBarFill, { width: "1%", backgroundColor: "#EF4444" }]} />
                </View>
                <Text style={styles.ratingCount}>1</Text>
              </View>
            </View>

            <Text style={styles.reviewsTitle}>Avaliações recentes</Text>
            <View style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>João Silva</Text>
                <View style={styles.reviewStars}>
                  <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                  <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                  <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                  <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                  <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                </View>
              </View>
              <Text style={styles.reviewDate}>2 dias atrás</Text>
              <Text style={styles.reviewText}>Excelente produto! Entrega rápida e bem embalado. Muito satisfeito!</Text>
            </View>

            <View style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>Maria Santos</Text>
                <View style={styles.reviewStars}>
                  <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                  <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                  <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                  <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                  <Ionicons name="star-outline" size={12} color={theme.colors.gray_300} />
                </View>
              </View>
              <Text style={styles.reviewDate}>1 semana atrás</Text>
              <Text style={styles.reviewText}>Bom produto, mas a entrega demorou um pouco mais que o esperado.</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ratingsModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  ratingsModalCard: {
    maxHeight: "90%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  ratingsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingsModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  ratingsSummary: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  ratingsSummaryNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  ratingsStars: {
    flexDirection: "row",
    gap: 4,
    marginVertical: 8,
  },
  ratingsCount: {
    fontSize: 12,
    color: theme.colors.gray_500,
  },
  ratingsBreakdown: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 12,
    color: theme.colors.gray_800,
    width: 80,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.gray_200,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: theme.colors.gray_500,
    width: 30,
    textAlign: "right",
  },
  reviewsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  reviewItem: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 12,
    color: theme.colors.gray_800,
    lineHeight: 18,
  },
});
