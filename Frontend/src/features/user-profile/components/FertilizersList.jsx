import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";
import { SurfaceCard } from "@/components/SurfaceCard";

export function FertilizersList({ insumos }) {
  return (
    <SurfaceCard style={styles.card}>
      <Text style={styles.sectionTitle}>Qualidade e Fertilizantes</Text>
      <Text style={styles.bioText}>
        Confira insumos e estercagem disponíveis para parcerias ou venda direta
        nesta propriedade.
      </Text>
      <View style={{ marginTop: 12 }}>
        {insumos.length === 0 ? (
          <Text style={styles.emptyText}>Sem insumos cadastrados.</Text>
        ) : null}
        {insumos.map((item) => (
          <View key={item.id} style={styles.rowItem}>
            <Ionicons
              name="cube-outline"
              size={16}
              color={theme.colors.gray_400}
            />
            <Text style={[styles.itemTitle, { marginLeft: 8 }]}>
              {item.title}
            </Text>
            <Text style={styles.amount}>{item.amount}</Text>
          </View>
        ))}
      </View>
    </SurfaceCard>
  );
}
