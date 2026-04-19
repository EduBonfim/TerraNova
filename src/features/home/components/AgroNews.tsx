import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { homeStyles as styles } from "../styles/home.styles";
import { SurfaceCard } from "@/components/SurfaceCard";

export function AgroNews() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notícias e Destaques</Text>

      <TouchableOpacity>
        <SurfaceCard style={styles.newsCard} bordered={false}>
          <View style={styles.newsImagePlaceholder}>
            <Ionicons
              name="newspaper-outline"
              size={32}
              color={theme.colors.gray_500}
            />
          </View>
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>
              Compostagem Orgânica: Reduza custos em até 40%
            </Text>
            <Text style={styles.newsSource}>Jornal do Campo • Hoje</Text>
          </View>
        </SurfaceCard>
      </TouchableOpacity>

      <TouchableOpacity>
        <SurfaceCard style={styles.newsCard} bordered={false}>
          <View style={styles.newsImagePlaceholder}>
            <Ionicons name="earth" size={32} color={theme.colors.gray_500} />
          </View>
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>
              Novos incentivos para a transição agroecológica
            </Text>
            <Text style={styles.newsSource}>AgroNews • Ontem</Text>
          </View>
        </SurfaceCard>
      </TouchableOpacity>
    </View>
  );
}
