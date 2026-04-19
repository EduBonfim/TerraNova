import { AppHeader } from "@/components/AppHeader";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RatingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Minhas Avaliações"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.ratingsSummary}>
            <Text style={styles.ratingsSummaryNumber}>4.9</Text>
            <View style={styles.ratingsStars}>
              <Ionicons name="star" size={20} color={theme.colors.orange_500} />
              <Ionicons name="star" size={20} color={theme.colors.orange_500} />
              <Ionicons name="star" size={20} color={theme.colors.orange_500} />
              <Ionicons name="star" size={20} color={theme.colors.orange_500} />
              <Ionicons name="star-half" size={20} color={theme.colors.orange_500} />
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
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
              </View>
            </View>
            <Text style={styles.reviewDate}>2 dias atrás</Text>
            <Text style={styles.reviewText}>
              Excelente produto! Entrega rápida e bem embalado. Muito satisfeito com a qualidade dos insumos.
            </Text>
          </View>

          <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>Maria Santos</Text>
              <View style={styles.reviewStars}>
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star-outline" size={14} color={theme.colors.gray_300} />
              </View>
            </View>
            <Text style={styles.reviewDate}>1 semana atrás</Text>
            <Text style={styles.reviewText}>
              Bom produto, mas a entrega demorou um pouco mais que o esperado devido à transportadora. O vendedor foi atencioso.
            </Text>
          </View>

          <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>Ricardo Oliveira</Text>
              <View style={styles.reviewStars}>
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
                <Ionicons name="star" size={14} color={theme.colors.orange_500} />
              </View>
            </View>
            <Text style={styles.reviewDate}>2 semanas atrás</Text>
            <Text style={styles.reviewText}>
              Sementes de ótima qualidade. Já comecei o plantio e a germinação está excelente. Recomendo!
            </Text>
          </View>
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  ratingsSummary: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ratingsSummaryNumber: {
    fontSize: 56,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  ratingsStars: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 10,
  },
  ratingsCount: {
    fontSize: 13,
    color: theme.colors.gray_500,
    fontWeight: "500",
  },
  ratingsBreakdown: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontWeight: "600",
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
    fontWeight: "bold",
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
    marginTop: 4,
  },
  reviewItem: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 13,
    color: theme.colors.gray_500,
    lineHeight: 20,
  },
});
