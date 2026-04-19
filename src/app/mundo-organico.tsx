import { AppHeader } from "@/components/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const theme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    teal: "#0D9488",
    teal_light: "#CCFBF1",
    purple: "#7C3AED",
    purple_light: "#EDE9FE",
    orange_500: "#F9A825",
  },
};

const HERO_FACTS = [
  { icon: "leaf", color: theme.colors.primary, bg: theme.colors.lightGreen, text: "O Brasil é o 5º maior produtor orgânico do mundo, com mais de 27 mil produtores certificados." },
  { icon: "water", color: theme.colors.teal, bg: theme.colors.teal_light, text: "A agricultura orgânica usa até 50% menos água que a convencional." },
  { icon: "earth", color: theme.colors.purple, bg: theme.colors.purple_light, text: "1 colher de terra orgânica saudável contém mais organismos vivos do que pessoas na Terra." },
  { icon: "fitness", color: "#F59E0B", bg: "#FEF3C7", text: "Alimentos orgânicos podem ter até 69% a mais de antioxidantes essenciais de acordo com novas pesquisas internacionais." },
  { icon: "bug", color: "#EF4444", bg: "#FEE2E2", text: "O agro ecológico protege as abelhas, que são responsáveis por polinizar incríveis 70% da nossa comida." },
];

const QUEM_E_PRODUTOR = `Um produtor orgânico é aquele que cultiva alimentos respeitando os ciclos da natureza, sem usar agrotóxicos sintéticos, fertilizantes químicos solúveis ou sementes geneticamente modificadas (OGMs).

Ao invés de tratar a terra apenas como uma fábrica contínua, o produtor orgânico foca em enriquecer o solo com biodiversidade e adubação verde, fazendo com que a planta cresça naturalmente forte.

Comprar orgânicos não é apenas uma escolha de saúde e dieta. É um ato vital para incentivar a preservação de nascentes, a sobrevivência de insetos como borboletas e garantir condições dignas (sem veneno) nas rotinas de trabalho no campo.`;

const BENEFITS = [
  { title: "Mais Nutrientes", desc: "Solos ricos entregam plantas com maior concentração de vitaminas livres.", icon: "nutrition-outline" },
  { title: "Sabor de Verdade", desc: "Ao crescer no tempo natural, os frutos acentuam seus açúcares e aromas.", icon: "restaurant-outline" },
  { title: "Segura Alimentar", desc: "Elimina a ingestão diária de pesticidas tóxicos que acumulam no corpo.", icon: "shield-half-outline" },
  { title: "Refúgio do Clima", desc: "Solos orgânicos funcionam como esponjas de carbono, combatendo o calor.", icon: "thermometer-outline" },
];

const CARD_WIDTH = Dimensions.get("window").width - 32;
const AUTO_PLAY_MS = 3500;

function HeroCarousel() {
  const flatRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dotAnims = useRef(HERO_FACTS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    const next = (index + HERO_FACTS.length) % HERO_FACTS.length;
    flatRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
    dotAnims.forEach((anim, i) =>
      Animated.spring(anim, {
        toValue: i === next ? 1 : 0,
        useNativeDriver: false,
        speed: 20,
        bounciness: 0,
      }).start()
    );
  }, [dotAnims]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % HERO_FACTS.length;
        goTo(next);
        return next;
      });
    }, AUTO_PLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goTo]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % HERO_FACTS.length;
        goTo(next);
        return next;
      });
    }, AUTO_PLAY_MS);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    if (index !== activeIndex) {
      goTo(index);
      resetTimer();
    }
  };

  return (
    <View style={styles.heroWrapper}>
      <FlatList
        ref={flatRef}
        data={HERO_FACTS}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: CARD_WIDTH, offset: CARD_WIDTH * index, index })}
        renderItem={({ item }) => (
          <View style={[styles.heroSlide, { width: CARD_WIDTH }]}>
            <View style={[styles.heroBg, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon as never} size={40} color={item.color} />
            </View>
            <Text style={styles.heroText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.heroDots}>
        {HERO_FACTS.map((_, i) => {
          const width = dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [8, 22] });
          const opacity = dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
          return (
            <TouchableOpacity key={i} onPress={() => { goTo(i); resetTimer(); }} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
              <Animated.View style={[styles.heroDot, { width, opacity }]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function BuyerOrganicScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Mundo Orgânico"
        subtitle="Entenda o poder do alimento limpo"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <HeroCarousel />

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person-circle-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>O Que é a Produção Orgânica?</Text>
          </View>
          <View style={styles.textCard}>
            {QUEM_E_PRODUTOR.split("\n\n").map((par, i) => (
              <Text key={i} style={[styles.bodyText, i > 0 && { marginTop: 12 }]}>
                {par.replace(/\*\*/g, "")}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="heart-outline" size={22} color={theme.colors.orange_500} />
            <Text style={styles.sectionTitle}>Por que Escolher Orgânicos?</Text>
          </View>
          <View style={styles.benefitsGrid}>
             {BENEFITS.map((item, i) => (
                <View key={i} style={styles.benefitCard}>
                   <View style={styles.benefitIconBox}>
                      <Ionicons name={item.icon as any} size={22} color={theme.colors.primary} />
                   </View>
                   <Text style={styles.benefitTitle}>{item.title}</Text>
                   <Text style={styles.benefitDesc}>{item.desc}</Text>
                </View>
             ))}
          </View>
        </View>

        <View style={styles.ctaCard}>
          <Ionicons name="search-outline" size={32} color={theme.colors.primary} style={{ marginBottom: 10 }} />
          <Text style={styles.ctaTitle}>Transparência na Mesa</Text>
          <Text style={styles.ctaText}>
            No Terra Nova, todo produtor orgânico exibe publicamente o seu certificado do SisOrg. Você pode validar pelo QR Code do Ministério da Agricultura na seção de certificados.
          </Text>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => router.push("/buyer-certificates" as never)}
          >
            <Text style={styles.actionBtnText}>Ver Certificados MAPA</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Hero carrossel
  heroWrapper: { marginHorizontal: 16, marginVertical: 12 },
  heroSlide: { backgroundColor: theme.colors.white, borderRadius: 16, padding: 20, alignItems: "center", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  heroBg: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  heroText: { fontSize: 15, color: theme.colors.gray_800, textAlign: "center", lineHeight: 22, fontWeight: "500" },
  heroDots: { flexDirection: "row", gap: 6, marginTop: 14, justifyContent: "center" },
  heroDot: { height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },

  // Sections
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: theme.colors.gray_800 },
  
  textCard: { backgroundColor: theme.colors.white, borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.primary, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  bodyText: { fontSize: 14, color: theme.colors.gray_800, lineHeight: 22 },

  // CTA
  ctaCard: {
    margin: 16,
    backgroundColor: theme.colors.lightGreen,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ctaTitle: { fontSize: 16, fontWeight: "bold", color: theme.colors.primary, textAlign: "center", marginBottom: 8 },
  ctaText: { fontSize: 13, color: theme.colors.gray_800, textAlign: "center", lineHeight: 20, marginBottom: 16 },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnText: {
    color: theme.colors.white,
    fontWeight: "bold",
  },
  
  // Benefits
  benefitsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 8 },
  benefitCard: { width: "48%", backgroundColor: theme.colors.white, borderRadius: 12, padding: 12, marginBottom: 12, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  benefitIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.lightGreen, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  benefitTitle: { fontSize: 13, fontWeight: "bold", color: theme.colors.gray_800, marginBottom: 4 },
  benefitDesc: { fontSize: 11, color: theme.colors.gray_500, lineHeight: 15 },
});
