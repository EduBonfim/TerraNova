import { SurfaceCard } from "@/components/SurfaceCard";
import { appTheme as theme } from "@/theme/appTheme";
import type { ProducerKPI } from "@/utils/producerAnalytics";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { homeStyles as styles } from "@/features/home/styles/home.styles";
import { useRouter } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface KpiCarouselProps {
  kpis: ProducerKPI;
}

export function KpiCarousel({ kpis }: KpiCarouselProps) {
  const router = useRouter();
  const [currentKpiIndex, setCurrentKpiIndex] = useState(0);
  const kpiCarouselRef = useRef<ScrollView>(null);

  // Formata valor de vendas mensais
  const formatMonthlySales = (value: number): string => {
    if (value === 0) return "R$ 0";
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  const kpiItems = [
    {
      id: "ads",
      icon: "pricetag",
      iconColor: theme.colors.primary,
      value: kpis.totalAds,
      label: "Anúncios",
      onPress: () => router.push("/stock"),
    },
    {
      id: "rating",
      icon: "star",
      iconColor: "#FBBF24",
      value: kpis.averageRating.toFixed(1),
      label: "Avaliação",
      onPress: () => router.push("/ratings"),
    },
    {
      id: "sales",
      icon: "cash",
      iconColor: theme.colors.accent,
      value: formatMonthlySales(kpis.monthlySales),
      label: "Vendas/Mês",
      onPress: () => router.push({ pathname: "/my-orders", params: { type: "sales" } }),
    },
    {
      id: "followers",
      icon: "people",
      iconColor: theme.colors.orange_500,
      value: kpis.followers,
      label: "Seguidores",
      onPress: () => router.push("/(producer)/follows"),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKpiIndex((prev) => {
        const nextIndex = (prev + 1) % kpiItems.length;
        kpiCarouselRef.current?.scrollTo({
          x: nextIndex * (SCREEN_WIDTH - 32),
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [kpiItems.length]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Meu Desempenho</Text>

      <ScrollView
        ref={kpiCarouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        snapToInterval={SCREEN_WIDTH - 32}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        onScroll={(event) => {
          const contentOffsetX = event.nativeEvent.contentOffset.x;
          const index = Math.round(contentOffsetX / (SCREEN_WIDTH - 32));
          if (index !== currentKpiIndex && index < kpiItems.length) {
            setCurrentKpiIndex(index);
          }
        }}
        style={styles.kpiCarouselScroll}
      >
        {kpiItems.map((item) => (
          <View
            key={item.id}
            style={[styles.kpiCarouselItem, { width: SCREEN_WIDTH - 32 }]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <SurfaceCard style={styles.kpiCard} bordered={false}>
                <View style={styles.kpiCardContent}>
                  <View style={styles.kpiIconCircle}>
                    <Ionicons
                      name={item.icon as any}
                      size={48}
                      color={item.iconColor}
                    />
                  </View>
                  <Text style={styles.kpiCarouselValue}>{item.value}</Text>
                  <Text style={styles.kpiCarouselLabel}>{item.label}</Text>
                </View>
              </SurfaceCard>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.kpiDotsContainer}>
        {kpiItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.kpiDot,
              index === currentKpiIndex && styles.kpiDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}
