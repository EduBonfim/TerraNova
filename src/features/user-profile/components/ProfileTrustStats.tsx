import { SurfaceCard } from "@/components/SurfaceCard";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";

interface ProfileTrustStatsProps {
  salesCount: number;
  rating: number;
  certificatesCount: number;
  bio: string;
  isCepValidated: boolean;
  isGatePinConfirmed: boolean;
  locationValidatedAt?: string;
}

export function ProfileTrustStats({
  salesCount,
  rating,
  certificatesCount,
  bio,
  isCepValidated,
  isGatePinConfirmed,
  locationValidatedAt,
}: ProfileTrustStatsProps) {
  const formatValidationTimestamp = (value?: string) => {
    if (!value) return "Nao validado";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Nao validado";
    return date.toLocaleString("pt-BR");
  };

  return (
    <>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{salesCount}</Text>
          <Text style={styles.statLabel}>Vendas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{rating}</Text>
          <Text style={styles.statLabel}>Avaliação</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{certificatesCount}</Text>
          <Text style={styles.statLabel}>Certificados</Text>
        </View>
      </View>

      <SurfaceCard style={styles.card}>
        <Text style={styles.sectionTitle}>Sobre o Produtor</Text>
        <Text style={styles.bioText}>{bio}</Text>
      </SurfaceCard>

      <View style={styles.trustCard}>
        <Text style={styles.trustTitle}>Selo de Confiabilidade de Localização</Text>

        <View style={styles.trustRow}>
          <Ionicons
            name={isCepValidated ? "checkmark-circle" : "alert-circle-outline"}
            size={16}
            color={isCepValidated ? theme.colors.primary : theme.colors.gray_500}
          />
          <Text style={styles.trustText}>CEP validado</Text>
        </View>

        <View style={styles.trustRow}>
          <Ionicons
            name={isGatePinConfirmed ? "checkmark-circle" : "alert-circle-outline"}
            size={16}
            color={isGatePinConfirmed ? theme.colors.primary : theme.colors.gray_500}
          />
          <Text style={styles.trustText}>Pin confirmado manualmente</Text>
        </View>

        <View style={styles.trustRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.gray_500} />
          <Text style={styles.trustText}>
            Última validação: {formatValidationTimestamp(locationValidatedAt)}
          </Text>
        </View>
      </View>
    </>
  );
}
