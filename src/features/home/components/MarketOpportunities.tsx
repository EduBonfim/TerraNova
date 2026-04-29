import { SurfaceCard } from "@/components/SurfaceCard";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { homeStyles as styles } from "../styles/home.styles";

export function MarketOpportunities() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💡 Oportunidades</Text>

      <TouchableOpacity onPress={() => router.push("/(producer)/profile")}>
        <SurfaceCard style={styles.alertCard} bordered={false}>
          <View style={[styles.alertIcon, { backgroundColor: "#DBEAFE" }]}>
            <Ionicons
              name="trending-up"
              size={20}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>Demanda em Alta: Orgânicos</Text>
            <Text style={styles.alertDesc}>
              Frutas e hortaliças orgânicas têm procura 40% acima da média.
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.gray_500}
          />
        </SurfaceCard>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(producer)/profile")}>
        <SurfaceCard style={styles.alertCard} bordered={false}>
          <View style={[styles.alertIcon, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons
              name="pricetag"
              size={20}
              color={theme.colors.orange_500}
            />
          </View>
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>Bom Preço: Coma Localizada</Text>
            <Text style={styles.alertDesc}>
              Produtores locais pagam até 20% mais por volume direto.
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.gray_500}
          />
        </SurfaceCard>
      </TouchableOpacity>
    </View>
  );
}
