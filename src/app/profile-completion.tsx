import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { calculateProfileCompletion } from "@/features/account/utils/profileCompletion";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileCompletionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { percentage, steps } = calculateProfileCompletion(user);

  const sortedSteps = useMemo(() => {
    return [...steps].sort((a, b) => {
      if (a.isCompleted === b.isCompleted) return 0;
      return a.isCompleted ? 1 : -1;
    });
  }, [steps]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Progresso do Perfil"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Banner de Progresso Premium */}
        <View style={styles.headerCard}>
          <View style={styles.progressCircleContainer}>
             <View style={[styles.progressInner, { height: `${percentage}%` }]} />
             <Text style={styles.percentageText}>{percentage}%</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {percentage === 100 
                ? "Perfil 100% Completo! 🎉" 
                : "Saúde do seu perfil"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {percentage === 100 
                ? "Sua conta está verificada e pronta para o mercado." 
                : "Complete todos os itens para ganhar o selo de confiança."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist de tarefas</Text>
          
          {sortedSteps.map((step) => (
            <TouchableOpacity 
              key={step.id} 
              style={[styles.stepCard, step.isCompleted && styles.stepCardCompleted]}
              onPress={() => router.push(step.route as any)}
              disabled={step.isCompleted}
              activeOpacity={0.7}
            >
              <View style={[styles.statusIndicator, { backgroundColor: step.isCompleted ? theme.colors.primary : theme.colors.orange_500 }]} />
              
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text style={[styles.stepLabel, step.isCompleted && styles.stepLabelCompleted]}>
                    {step.label}
                  </Text>
                  {step.isCompleted && (
                    <Ionicons name="checkmark-done-circle" size={18} color={theme.colors.primary} />
                  )}
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>

              {!step.isCompleted && (
                <View style={styles.goAction}>
                  <Text style={styles.goText}>IR</Text>
                  <Ionicons name="arrow-forward" size={12} color={theme.colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Card de Dica Estilo Consumidor */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Benefícios do perfil 100%</Text>
            <Text style={styles.tipText}>
              Perfis verificados aparecem primeiro nas buscas e geram muito mais confiança para novos negócios.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  
  headerCard: {
    backgroundColor: theme.colors.white,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  progressCircleContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.gray_100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: theme.colors.gray_200,
  },
  progressInner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(107, 142, 35, 0.15)",
  },
  percentageText: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
    zIndex: 1,
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.gray_500,
    lineHeight: 18,
  },

  section: { padding: 16 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.primary,
    textTransform: "uppercase",
    marginBottom: 16,
    letterSpacing: 1,
  },
  
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  stepCardCompleted: {
    backgroundColor: theme.colors.gray_200,
    borderColor: theme.colors.gray_200,
    opacity: 0.7,
  },
  statusIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    position: "absolute",
    left: 0,
  },
  stepContent: { flex: 1, paddingLeft: 12 },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  stepLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.gray_800,
  },
  stepLabelCompleted: {
    color: theme.colors.gray_500,
    textDecorationLine: "line-through",
  },
  stepDescription: {
    fontSize: 12,
    color: theme.colors.gray_500,
    lineHeight: 16,
  },
  goAction: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  goText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "bold",
  },

  tipCard: {
    margin: 16,
    padding: 20,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(107, 142, 35, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: theme.colors.gray_600,
    lineHeight: 18,
  }
});
