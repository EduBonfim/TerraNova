import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const theme = {
  colors: {
    primary: "#6B8E23",
    primaryDark: "#4A6B1A",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    orange_500: "#F9A825",
    orange_light: "#FFF8E1",
    teal: "#0D9488",
    teal_light: "#CCFBF1",
    purple: "#7C3AED",
    purple_light: "#EDE9FE",
    amber: "#B45309",
    amber_light: "#FEF3C7",
  },
};

const ETAPAS_TRANSICAO = [
  {
    id: 1,
    icon: "ban-outline",
    cor: "#EF4444",
    bg: "#FEE2E2",
    titulo: "Suspensão dos Insumos Químicos",
    descricao: "O primeiro passo é parar o uso de agrotóxicos e fertilizantes sintéticos. O período mínimo de transição é de 12 meses para pastagens e 18 meses para culturas anuais.",
    curiosidade: "Durante esse período o solo começa a se 'curar' — microrganismos benéficos voltam a colonizar a terra.",
  },
  {
    id: 2,
    icon: "flask-outline",
    cor: theme.colors.teal,
    bg: theme.colors.teal_light,
    titulo: "Manejo do Solo com Bioinsumos",
    descricao: "A fertilidade é restaurada com compostagem, adubação verde, esterco curtido e biofertilizantes. Cada insumo usado deve ter origem controlada e rastreável.",
    curiosidade: "A minhoca é uma das melhores aliadas: ela processa até 4x seu peso em matéria orgânica por dia.",
  },
  {
    id: 3,
    icon: "document-text-outline",
    cor: theme.colors.amber,
    bg: theme.colors.amber_light,
    titulo: "Documentação e Caderno de Campo",
    descricao: "Tudo precisa ser registrado: sementes usadas, origem da água, histórico de tratamentos. Esse caderno é a base da auditoria.",
    curiosidade: "Um produtor bem documentado resolve disputas com compradores e auditorias em minutos.",
  },
  {
    id: 4,
    icon: "git-network-outline",
    cor: theme.colors.purple,
    bg: theme.colors.purple_light,
    titulo: "Escolha da Modalidade de Certificação",
    descricao: "Existem 3 caminhos reconhecidos pelo MAPA: Auditoria por empresa credenciada, SPG (Sistema Participativo de Garantia, feito com outros produtores) e OCS (Organismo de Controle Social, para venda direta).",
    curiosidade: "O SPG é o mais acessível para pequenos e médios produtores — é feito em rede, com visitas cruzadas entre agricultores.",
  },
  {
    id: 5,
    icon: "shield-checkmark-outline",
    cor: theme.colors.primary,
    bg: theme.colors.lightGreen,
    titulo: "Auditoria e Emissão do Selo SisOrg",
    descricao: "Após a vistoria técnica, o produtor entra no Cadastro Nacional de Produtores Orgânicos e recebe o direito de usar o Selo SisOrg nos seus produtos.",
    curiosidade: "O Selo SisOrg pode ser rastreado por qualquer consumidor no site do MAPA.",
  },
  {
    id: 6,
    icon: "refresh-outline",
    cor: theme.colors.orange_500,
    bg: theme.colors.orange_light,
    titulo: "Renovação Anual e Rastreabilidade Contínua",
    descricao: "A certificação não é permanente. O produtor é auditado anualmente e deve manter o caderno de campo atualizado, garantindo rastreabilidade total.",
    curiosidade: "Cada lote produzido tem um código único que liga a colheita ao solo, às sementes e ao produtor.",
  },
];

const CUIDADOS = [
  { icon: "bug-outline", titulo: "Controle Biológico", desc: "Em vez de veneno, usam predadores naturais, armadilhas e repelentes naturais." },
  { icon: "rainy-outline", titulo: "Gestão da Água", desc: "Preferem irrigação por gotejamento, aproveitamento de água da chuva e curvas de nível." },
  { icon: "people-outline", titulo: "Bem-Estar", desc: "A norma orgânica exige condições dignas de trabalho — sem exposição a agentes tóxicos." },
  { icon: "flower-outline", titulo: "Biodiversidade", desc: "São obrigados a manter áreas de mata nativa, corredores ecológicos." },
];

function EtapaCard({ etapa }: { etapa: typeof ETAPAS_TRANSICAO[0] }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((p) => !p);
  };

  return (
    <TouchableOpacity style={styles.etapaCard} onPress={toggle} activeOpacity={0.85}>
      <View style={styles.etapaHeader}>
        <View style={[styles.etapaIconCircle, { backgroundColor: etapa.bg }]}>
          <Ionicons name={etapa.icon as never} size={22} color={etapa.cor} />
        </View>
        <View style={styles.etapaHeaderText}>
          <Text style={styles.etapaStep}>Etapa {etapa.id}</Text>
          <Text style={styles.etapaTitulo}>{etapa.titulo}</Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.gray_500} />
      </View>

      {open && (
        <View style={styles.etapaBody}>
          <Text style={styles.etapaDescricao}>{etapa.descricao}</Text>
          <View style={styles.curiosidadeBox}>
            <Ionicons name="bulb-outline" size={14} color={theme.colors.orange_500} />
            <Text style={styles.curiosidadeText}>{etapa.curiosidade}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ProducerOrganicScreen() {
  const router = useRouter();

  const handleOpenMapa = () => {
    Linking.openURL('https://www.gov.br/agricultura/pt-br/assuntos/sustentabilidade/organicos');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Seja Orgânico!"
        subtitle="O passo a passo para a formalização do seu cultivo"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.introCard}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.introText}>
            Tornar-se um produtor orgânico não é apenas mudar o plantio, é se adequar a normas sérias. Veja a jornada para conquistar o selo brasileiro (SisOrg).
          </Text>
        </View>

        {/* ─── Etapas da certificação ─── */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="git-commit-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>A Jornada até o Selo</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Como funciona o processo de transição na prática, etapa por etapa.
          </Text>
          {ETAPAS_TRANSICAO.map((e) => (
            <EtapaCard key={e.id} etapa={e} />
          ))}
        </View>

        {/* ─── Cuidados do produtor ─── */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="heart-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Os Cuidados Diários</Text>
          </View>
          <View style={styles.cuidadosGrid}>
            {CUIDADOS.map((c, i) => (
              <View key={i} style={styles.cuidadoCard}>
                <View style={styles.cuidadoIconCircle}>
                  <Ionicons name={c.icon as never} size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.cuidadoTitulo}>{c.titulo}</Text>
                <Text style={styles.cuidadoDesc}>{c.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── CTA: Cartilha do MAPA ─── */}
        <View style={styles.ctaCard}>
          <Ionicons name="book-outline" size={32} color={theme.colors.white} style={{ marginBottom: 10 }} />
          <Text style={styles.ctaTitle}>Cartilha Oficial de Orgânicos</Text>
          <Text style={styles.ctaText}>
            Acesse as cartilhas completas e atualizadas diretamente do Ministério da Agricultura (MAPA) com resoluções vigentes.
          </Text>
          
          <TouchableOpacity style={styles.mapaButton} onPress={handleOpenMapa}>
            <Text style={styles.mapaButtonText}>Acessar Portal do MAPA</Text>
            <Ionicons name="open-outline" size={18} color={theme.colors.primary} />
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

  introCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.lightGreen,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: "center",
  },
  introText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.gray_800,
    lineHeight: 20,
  },

  // Sections
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: theme.colors.gray_800 },
  sectionSubtitle: { fontSize: 13, color: theme.colors.gray_500, lineHeight: 19, marginBottom: 12 },

  // Etapas
  etapaCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: "hidden",
  },
  etapaHeader: { flexDirection: "row", alignItems: "center", padding: 14 },
  etapaIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginRight: 12 },
  etapaHeaderText: { flex: 1 },
  etapaStep: { fontSize: 11, fontWeight: "bold", color: theme.colors.orange_500, textTransform: "uppercase" },
  etapaTitulo: { fontSize: 14, fontWeight: "bold", color: theme.colors.gray_800, marginTop: 2 },
  etapaBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: theme.colors.gray_200 },
  etapaDescricao: { fontSize: 13, color: theme.colors.gray_800, lineHeight: 20, marginTop: 10 },
  curiosidadeBox: { flexDirection: "row", backgroundColor: theme.colors.orange_light, borderRadius: 8, padding: 10, marginTop: 10, gap: 8, alignItems: "flex-start" },
  curiosidadeText: { flex: 1, fontSize: 12, color: theme.colors.amber, lineHeight: 18, fontStyle: "italic" },

  // Cuidados
  cuidadosGrid: { gap: 10 },
  cuidadoCard: { backgroundColor: theme.colors.white, borderRadius: 14, padding: 14, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  cuidadoIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.lightGreen, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  cuidadoTitulo: { fontSize: 14, fontWeight: "bold", color: theme.colors.gray_800, marginBottom: 4 },
  cuidadoDesc: { fontSize: 13, color: theme.colors.gray_500, lineHeight: 19 },

  // CTA
  ctaCard: {
    margin: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  ctaTitle: { fontSize: 18, fontWeight: "bold", color: theme.colors.white, textAlign: "center", marginBottom: 8 },
  ctaText: { fontSize: 14, color: theme.colors.lightGreen, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  mapaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  mapaButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
