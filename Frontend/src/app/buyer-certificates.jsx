import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { getUsers } from "@/services/authStore";
import { getCertificates, getProfile } from "@/services/communityStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
    gray_300: "#D1D5DB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    orange_500: "#F9A825",
    green_600: "#2E7D32",
    amber: "#B45309",
    amber_light: "#FEF3C7",
  },
};

// Coleta todos os produtores (role "producer") com seus certificados aprovados
async function getAllProducersWithCerts() {
  const users = await getUsers();
  const filteredUsers = users.filter((u) => u.role === "producer" || !u.role);
  return filteredUsers
    .map((u) => {
      const profileName = u.fullName || u.username;
      const profile = getProfile(profileName);
      const approved = getCertificates(profileName, "approved");
      const pending = getCertificates(profileName, "pending");
      return { user: u, profile, profileName, approved, pending };
    })
    .filter((p) => p.approved.length > 0 || p.pending.length > 0);
}

export default function BuyerCertificatesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [producers, setProducers] = useState([]);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducers = async () => {
      try {
        const data = await getAllProducersWithCerts();
        setProducers(data);
      } catch (error) {
        console.error("Erro ao carregar produtores:", error);
        setProducers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return producers
      .map((p) => {
        const certs = [
          ...(filter === "pending" ? [] : p.approved),
          ...(filter === "approved" ? [] : p.pending),
        ];
        return { ...p, certs };
      })
      .filter((p) => {
        if (p.certs.length === 0) return false;
        if (!q) return true;
        return (
          p.profileName.toLowerCase().includes(q) ||
          p.profile.farmName?.toLowerCase().includes(q) ||
          p.certs.some(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              c.issuer.toLowerCase().includes(q)
          )
        );
      });
  }, [producers, search, filter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Certificados dos Produtores"
        subtitle="Verifique a conformidade de quem você compra"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <View style={styles.stickyHeader}>
        {/* Barra de busca */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={theme.colors.gray_500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtor ou certificado..."
            placeholderTextColor={theme.colors.placeholder}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={16}
                color={theme.colors.gray_500}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <View style={styles.filterRow}>
          {["all", "approved", "pending"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                filter === f && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f && styles.filterChipTextActive,
                ]}
              >
                {f === "all"
                  ? "Todos"
                  : f === "approved"
                  ? "✓ Aprovados"
                  : "⏳ Em análise"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Banner informativo */}
        <View style={styles.infoBanner}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>
            Certificados aprovados são verificados pelo MAPA. Produtores com o
            selo <Text style={styles.infoHighlight}>✓ Ativo</Text> passaram por
            auditoria oficial.
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-outline"
              size={40}
              color={theme.colors.gray_300}
            />
            <Text style={styles.emptyTitle}>Nenhum resultado</Text>
            <Text style={styles.emptyDesc}>
              {search
                ? `Nenhum produtor encontrado para "${search}"`
                : "Nenhum produtor com certificados nesta categoria ainda."}
            </Text>
          </View>
        ) : (
          filtered.map((p) => (
            <SurfaceCard key={p.user.username} style={styles.producerCard}>
              {/* Cabeçalho do produtor */}
              <View style={styles.producerHeader}>
                {p.profile.avatarUri ? (
                  <Image
                    source={{ uri: p.profile.avatarUri }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Ionicons
                      name="leaf"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                )}
                <View style={styles.producerInfo}>
                  <Text style={styles.producerName}>
                    {p.profile.displayName}
                  </Text>
                  <Text style={styles.producerFarm}>{p.profile.farmName}</Text>
                  <View style={styles.producerLocationRow}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color={theme.colors.gray_500}
                    />
                    <Text style={styles.producerLocation}>
                      {p.profile.farmAddress}
                    </Text>
                  </View>
                </View>
                <View style={styles.certCountBadge}>
                  <Text style={styles.certCountText}>{p.certs.length}</Text>
                  <Text style={styles.certCountLabel}>cert.</Text>
                </View>
              </View>

              {/* Certificados */}
              <View style={styles.certsDivider} />
              {p.certs.map((cert, i) => (
                <View
                  key={cert.id}
                  style={[styles.certRow, i > 0 && styles.certRowBorder]}
                >
                  <View style={styles.certLeft}>
                    <View
                      style={[
                        styles.statusDot,
                        cert.status === "approved"
                          ? styles.statusDotApproved
                          : styles.statusDotPending,
                      ]}
                    />
                  </View>
                  <View style={styles.certContent}>
                    <View style={styles.certTitleRow}>
                      <Text style={styles.certTitle} numberOfLines={1}>
                        {cert.title}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          cert.status === "approved"
                            ? styles.statusApproved
                            : styles.statusPending,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            cert.status === "approved"
                              ? styles.statusTextApproved
                              : styles.statusTextPending,
                          ]}
                        >
                          {cert.status === "approved" ? "Ativo" : "Em análise"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.certMeta}>Nº {cert.number}</Text>
                    <Text style={styles.certMeta}>{cert.issuer}</Text>
                    <Text style={styles.certDates}>
                      Emissão: {cert.issueDate}
                      {cert.expiryDate !== "Em análise"
                        ? `  •  Validade: ${cert.expiryDate}`
                        : ""}
                    </Text>
                  </View>
                </View>
              ))}
            </SurfaceCard>
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },

  stickyHeader: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    gap: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  searchInput: { flex: 1, fontSize: 14, color: theme.colors.gray_800 },

  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.gray_500,
  },
  filterChipTextActive: { color: theme.colors.white },

  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.lightGreen,
    margin: 12,
    padding: 12,
    borderRadius: 10,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.gray_800,
    lineHeight: 18,
  },
  infoHighlight: { fontWeight: "bold", color: theme.colors.green_600 },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  emptyDesc: {
    fontSize: 13,
    color: theme.colors.gray_500,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 19,
  },

  producerCard: { margin: 12, marginBottom: 0, padding: 14 },

  producerHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  producerInfo: { flex: 1 },
  producerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  producerFarm: { fontSize: 12, color: theme.colors.gray_500, marginTop: 1 },
  producerLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  producerLocation: { fontSize: 11, color: theme.colors.gray_500 },

  certCountBadge: {
    alignItems: "center",
    backgroundColor: theme.colors.lightGreen,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  certCountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  certCountLabel: {
    fontSize: 9,
    color: theme.colors.primary,
    fontWeight: "600",
  },

  certsDivider: {
    height: 1,
    backgroundColor: theme.colors.gray_200,
    marginVertical: 12,
  },

  certRow: { flexDirection: "row", paddingVertical: 8 },
  certRowBorder: { borderTopWidth: 1, borderTopColor: theme.colors.gray_200 },
  certLeft: { width: 20, alignItems: "center", paddingTop: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusDotApproved: { backgroundColor: theme.colors.green_600 },
  statusDotPending: { backgroundColor: theme.colors.orange_500 },

  certContent: { flex: 1 },
  certTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  certTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusApproved: { backgroundColor: "#E8F5E9" },
  statusPending: { backgroundColor: theme.colors.amber_light },
  statusText: { fontSize: 10, fontWeight: "bold" },
  statusTextApproved: { color: theme.colors.green_600 },
  statusTextPending: { color: theme.colors.amber },
  certMeta: { fontSize: 12, color: theme.colors.gray_500, marginBottom: 1 },
  certDates: { fontSize: 11, color: theme.colors.gray_500, marginTop: 3 },
});
