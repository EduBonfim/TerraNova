import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeInUp,
} from "react-native-reanimated";

const theme = {
  colors: {
    primary: "#6B8E23",
    primaryDark: "#4A6B1A",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F8FAF8",
    gray_200: "#E5E7EB",
    gray_400: "#9CA3AF",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    orange_500: "#F9A825",
    orange_light: "#FFF8E1",
  },
};

export default function RegisterTypeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAF8" />

      {/* Elementos de fundo */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Cabeçalho personalizado */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.gray_800}
          />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Criar sua Conta</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Cabeçalho */}
            <Animated.View
              entering={FadeInUp.duration(800)}
              style={styles.header}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name="person-add"
                  size={32}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.title}>Quem é você no Terra Nova?</Text>
              <Text style={styles.subtitle}>
                Escolha o perfil que melhor define sua jornada na agroecologia.
              </Text>
            </Animated.View>

            {/* Cards de seleção */}
            <View style={styles.cardsContainer}>
              {/* Card: Produtor */}
              <Animated.View entering={FadeInLeft.delay(200).duration(800)}>
                <TouchableOpacity
                  style={[styles.card, styles.cardProducer]}
                  onPress={() => router.push("/register")}
                  activeOpacity={0.9}
                >
                  <View
                    style={[styles.cardIconWrapper, styles.cardIconProducer]}
                  >
                    <Ionicons
                      name="leaf"
                      size={28}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.cardContent}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Sou Produtor
                    </Text>
                    <Text style={styles.cardDescription}>
                      Tenho uma propriedade rural e quero vender meus produtos
                      na plataforma.
                    </Text>
                    <View style={styles.badgeList}>
                      <View style={styles.badgeItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.badgeItemText}>Criar anúncios</Text>
                      </View>
                      <View style={styles.badgeItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.badgeItemText}>
                          Gestão de estoque
                        </Text>
                      </View>
                      <View style={styles.badgeItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.badgeItemText}>
                          Relatórios e métricas
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.arrowCircle}>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Card: Comprador */}
              <Animated.View entering={FadeInRight.delay(400).duration(800)}>
                <TouchableOpacity
                  style={[styles.card, styles.cardBuyer]}
                  onPress={() => router.push("/register-buyer")}
                  activeOpacity={0.9}
                >
                  <View style={[styles.cardIconWrapper, styles.cardIconBuyer]}>
                    <Ionicons
                      name="bag-handle"
                      size={28}
                      color={theme.colors.orange_500}
                    />
                  </View>
                  <View style={styles.cardContent}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: theme.colors.orange_500 },
                      ]}
                    >
                      Sou Consumidor
                    </Text>
                    <Text style={styles.cardDescription}>
                      Quero comprar produtos orgânicos e agroecológicos direto
                      do produtor.
                    </Text>
                    <View style={styles.badgeList}>
                      <View style={styles.badgeItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={theme.colors.orange_500}
                        />
                        <Text style={styles.badgeItemText}>
                          Compras no marketplace
                        </Text>
                      </View>
                      <View style={styles.badgeItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={theme.colors.orange_500}
                        />
                        <Text style={styles.badgeItemText}>
                          Rastreio de pedidos
                        </Text>
                      </View>
                      <View style={styles.badgeItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={theme.colors.orange_500}
                        />
                        <Text style={styles.badgeItemText}>
                          Cadastro rápido
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.arrowCircle,
                      { backgroundColor: "rgba(249,168,37,0.1)" },
                    ]}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.orange_500}
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ScrollView>

        {/* Rodapé Fixo na Parte de Baixo */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(800)}
          style={styles.footerFixed}
        >
          <Text style={styles.footerText}>Já faz parte da nossa rede?</Text>
          <TouchableOpacity
            onPress={() => router.replace("/login")}
            style={styles.loginBtn}
          >
            <Text style={styles.loginLink}>Fazer login no portal</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAF8" },

  // Background Decorations
  bgCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(107, 142, 35, 0.04)",
  },
  bgCircle2: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(249, 168, 37, 0.04)",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.gray_800,
  },

  mainWrapper: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  container: {
    padding: 20,
    paddingTop: 10,
  },

  header: { alignItems: "center", marginBottom: 24 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.gray_800,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.gray_500,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: "90%",
  },

  cardsContainer: { gap: 16 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    padding: 20,
    backgroundColor: theme.colors.white,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardProducer: {
    borderLeftWidth: 6,
    borderLeftColor: theme.colors.primary,
  },
  cardBuyer: {
    borderLeftWidth: 6,
    borderLeftColor: theme.colors.orange_500,
  },

  cardIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardIconProducer: { backgroundColor: "rgba(107,142,35,0.08)" },
  cardIconBuyer: { backgroundColor: "rgba(249,168,37,0.08)" },

  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.gray_500,
    lineHeight: 18,
    marginBottom: 12,
  },
  badgeList: { gap: 6 },
  badgeItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  badgeItemText: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "600",
  },

  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(107, 142, 35, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  footerFixed: {
    alignItems: "center",
    padding: 24,
    paddingTop: 16,
    backgroundColor: "#F8FAF8",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
  },
  footerText: { fontSize: 13, color: theme.colors.gray_500, marginBottom: 12 },
  loginBtn: {
    paddingVertical: 14,
    width: "100%",
    borderRadius: 18,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.gray_800,
  },
});
