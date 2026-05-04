import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { appTheme as theme } from "@/theme/appTheme";
import { homeStyles as styles } from "@/features/home/styles/home.styles";

export function QuickActions() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ações Rápidas</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/scan")}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="beaker" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.actionText}>Análise de Solo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/my-orders")}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="bag-check" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.actionText}>Minhas Vendas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/stock")}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="layers" size={32} color={theme.colors.orange_500} />
          </View>
          <Text style={styles.actionText}>Gerenciar Estoque</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/messages")}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="chatbubble-ellipses" size={32} color="#8B5CF6" />
          </View>
          <Text style={styles.actionText}>Mensagens</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
