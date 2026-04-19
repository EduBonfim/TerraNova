import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { homeStyles as styles } from "../styles/home.styles";
import { SurfaceCard } from "@/components/SurfaceCard";
import type { ProducerKPI } from "@/utils/producerAnalytics";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface KpiCarouselProps {
  kpis: ProducerKPI;
}

export function KpiCarousel({ kpis }: KpiCarouselProps) {
  const [currentKpiIndex, setCurrentKpiIndex] = useState(0);
  const kpiCarouselRef = useRef<ScrollView>(null);

  const kpiItems = [
    {
      id: "ads",
      icon: "pricetag",
      iconColor: theme.colors.primary,
      value: kpis.totalAds,
      label: "Anúncios",
    },
    {
      id: "rating",
      icon: "star",
      iconColor: "#FBBF24",
      value: kpis.averageRating.toFixed(1),
      label: "Avaliação",
    },
    {
      id: "sales",
      icon: "cash",
      iconColor: theme.colors.accent,
      value: `R$ ${(kpis.monthlySales / 1000).toFixed(1)}k`,
      label: "Vendas/Mês",
    },
    {
      id: "followers",
      icon: "people",
      iconColor: theme.colors.orange_500,
      value: kpis.followers,
      label: "Seguidores",
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
