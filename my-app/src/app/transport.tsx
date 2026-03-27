import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const theme = {
  colors: {
    primary: '#6B8E23',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    background: '#F5F5F5',
    gray_200: '#E5E7EB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
    gray_900: '#111827',
    orange_500: '#F9A825',
  },
};

const IOS_VISUAL = {
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 16,
};

const ANDROID_VISUAL = {
  headerHeight: 76,
  headerPaddingBottom: 16,
  headerPaddingTop: 20,
};

const CURRENT_PLATFORM_UI = Platform.OS === 'ios' ? IOS_VISUAL : ANDROID_VISUAL;

export default function TransportRulesScreen() {
  const router = useRouter();
  const [selectedUf, setSelectedUf] = useState('GO');

  const UF_LINKS: Record<string, string> = {
    GO: 'https://www.agrodefesa.go.gov.br/',
    SP: 'https://www.defesa.agricultura.sp.gov.br/',
    MG: 'https://www.ima.mg.gov.br/',
    PR: 'https://www.adapar.pr.gov.br/',
    RS: 'https://www.agricultura.rs.gov.br/seapdr',
    SC: 'https://www.cidasc.sc.gov.br/',
    MT: 'https://www.indea.mt.gov.br/',
    MS: 'https://www.iagro.ms.gov.br/',
    BA: 'http://www.adab.ba.gov.br/',
  };

  const openExternalLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/account')}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Transporte e Frete</Text>
          <Text style={styles.headerSubtitle}>Regras oficiais para compras e entregas</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1) Regras nacionais do transporte rodoviario</Text>
          <Text style={styles.itemTitle}>RNTR-C obrigatorio</Text>
          <Text style={styles.itemText}>
            Transportador (TAC/ETC/CTC) precisa de registro ativo na ANTT (Lei 11.442/2007, art. 2o).
          </Text>

          <Text style={styles.itemTitle}>Vale-pedagio obrigatorio</Text>
          <Text style={styles.itemText}>
            O contratante deve antecipar o vale-pedagio antes do embarque. Nao pode embutir esse custo no frete do transportador
            (Lei 10.209/2001 e ANTT/Resolucao 6.024/2023).
          </Text>

          <Text style={styles.itemTitle}>Pagamento do frete</Text>
          <Text style={styles.itemText}>
            Pagamento ao TAC deve ser feito em conta/conta pre-paga, e custos bancarios da operacao ficam com quem paga o frete
            (Lei 11.442/2007, art. 5o-A).
          </Text>

          <Text style={styles.itemTitle}>Carga e descarga</Text>
          <Text style={styles.itemText}>
            Prazo maximo legal: 5 horas. Apos esse prazo, ha indenizacao por tonelada/hora (valor atualizado por INPC),
            com registro de horario de chegada no documento de transporte (Lei 11.442/2007, art. 11, par. 5o a 9o).
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>2) Horarios e dias da semana (jornada do motorista)</Text>
          <Text style={styles.itemText}>• Maximo de 5h30 de direcao continua.</Text>
          <Text style={styles.itemText}>• Descanso minimo de 30 min dentro de cada 6h de conducao.</Text>
          <Text style={styles.itemText}>• Em 24h, minimo de 11h de descanso (com 8h ininterruptas no primeiro periodo).</Text>
          <Text style={styles.itemText}>• Em viagens longas, repouso semanal total de 35h (24h + 11h).</Text>
          <Text style={styles.note}>
            Base legal: CTB art. 67-C e Lei 13.103/2015 (jornada e descanso do motorista profissional).
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>3) Frete das compras no app</Text>
          <Text style={styles.itemText}>
            O valor do frete pode variar por distancia, tipo de carga, peso/volume, pedagio e tempo de espera em carga/descarga.
          </Text>
          <Text style={styles.itemText}>
            Quando houver contratacao de transporte rodoviario remunerado, devem ser observadas as regras de pagamento legal,
            vale-pedagio e demais obrigacoes do contratante e transportador.
          </Text>
          <Text style={styles.itemText}>
            Recomendacao: confirmar no fechamento da compra a janela de coleta/entrega, custo de frete e eventuais custos extras.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>4) Atencao a restricoes locais</Text>
          <Text style={styles.itemText}>
            Restricoes de circulacao de caminhoes por dia e horario variam por municipio, zona e via.
          </Text>
          <Text style={styles.itemText}>
            Antes de rodar, confirme no orgao de transito da cidade de origem/destino (prefeitura, Detran, autoridade de transito local).
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>5) Transporte de materiais biologicos (estercagem)</Text>
          <Text style={styles.itemTitle}>O que entra nessa categoria</Text>
          <Text style={styles.itemText}>
            Esterco in natura, cama de aviario, dejetos e composto organico de origem animal destinados a adubacao.
          </Text>

          <Text style={styles.itemTitle}>Checklist minimo para transporte</Text>
          <Text style={styles.itemText}>• Documento fiscal/romaneio com origem, destino e quantidade.</Text>
          <Text style={styles.itemText}>• Identificacao do transportador e veiculo (RNTR-C quando houver frete rodoviario remunerado).</Text>
          <Text style={styles.itemText}>• Carga coberta e contida (lona/vedacao) para evitar derramamento, odor excessivo e contaminacao de via.</Text>
          <Text style={styles.itemText}>• Limpeza do veiculo apos descarga e segregacao de cargas para nao misturar com alimentos.</Text>

          <Text style={styles.itemTitle}>Biosseguranca e vigilancia sanitaria</Text>
          <Text style={styles.itemText}>
            Em situacoes de alerta zoossanitario, transito interestadual ou exigencia local, pode ser necessaria autorizacao da
            defesa agropecuaria estadual. As exigencias variam por UF e por tipo de material.
          </Text>
          <Text style={styles.itemText}>
            Regra pratica: antes de coletar esterco/cama de granja para outra cidade ou estado, confirmar requisitos no orgao estadual
            de defesa agropecuaria e, quando aplicavel, no MAPA/SUASA.
          </Text>

          <Text style={styles.itemTitle}>Horarios e dias de operacao</Text>
          <Text style={styles.itemText}>
            Alem das regras de jornada (descanso obrigatorio), devem ser respeitadas as restricoes municipais de circulacao de caminhoes
            por dia/horario. Essas restricoes sao locais e mudam entre municipios.
          </Text>
        </View>

        <View style={styles.sourcesBox}>
          <Text style={styles.sourcesTitle}>Fontes oficiais consultadas</Text>
          <Text style={styles.sourceItem}>• Planalto: Lei 11.442/2007 (TRC)</Text>
          <Text style={styles.sourceItem}>• Planalto: Lei 13.103/2015 (tempo de direcao e descanso)</Text>
          <Text style={styles.sourceItem}>• ANTT: Vale-Pedagio obrigatorio (Lei 10.209/2001 e Resolucao 6.024/2023)</Text>
          <Text style={styles.sourceItem}>• MAPA: Portal de Fertilizantes e orientacoes de fiscalizacao</Text>
          <Text style={styles.sourceItem}>• MAPA/SUASA: defesa agropecuaria e articulacao com orgaos estaduais</Text>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => openExternalLink('https://www.gov.br/agricultura/pt-br/assuntos/defesa-agropecuaria/suasa')}>
            <Ionicons name="open-outline" size={16} color={theme.colors.white} />
            <Text style={styles.linkButtonText}>Consultar MAPA / SUASA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButtonSecondary}
            onPress={() => openExternalLink('https://www.agrodefesa.go.gov.br/')}>
            <Ionicons name="business-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.linkButtonSecondaryText}>Defesa Agropecuaria GO (Agrodefesa)</Text>
          </TouchableOpacity>

          <Text style={styles.ufTitle}>Defesa Agropecuaria por estado (UF)</Text>
          <View style={styles.ufRow}>
            {Object.keys(UF_LINKS).map((uf) => (
              <TouchableOpacity
                key={uf}
                style={[styles.ufChip, selectedUf === uf && styles.ufChipActive]}
                onPress={() => setSelectedUf(uf)}>
                <Text style={[styles.ufChipText, selectedUf === uf && styles.ufChipTextActive]}>{uf}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => openExternalLink(UF_LINKS[selectedUf])}>
            <Ionicons name="open-outline" size={16} color={theme.colors.white} />
            <Text style={styles.linkButtonText}>Abrir Defesa Agropecuaria ({selectedUf})</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CURRENT_PLATFORM_UI.headerHeight,
    paddingHorizontal: 16,
    paddingBottom: CURRENT_PLATFORM_UI.headerPaddingBottom,
    paddingTop: CURRENT_PLATFORM_UI.headerPaddingTop,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    overflow: 'hidden',
  },
  backButton: { marginRight: 10, padding: 4 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.white },
  headerSubtitle: { fontSize: 14, color: theme.colors.white, marginTop: 2 },

  card: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.gray_900, marginBottom: 10 },
  itemTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.gray_800, marginTop: 8, marginBottom: 4 },
  itemText: { fontSize: 14, color: theme.colors.gray_800, lineHeight: 21, marginBottom: 4 },
  note: { fontSize: 13, color: theme.colors.gray_500, marginTop: 8, lineHeight: 19 },

  sourcesBox: {
    backgroundColor: theme.colors.lightGreen,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  sourcesTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.gray_900, marginBottom: 6 },
  sourceItem: { fontSize: 13, color: theme.colors.gray_800, lineHeight: 18 },
  linkButton: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  linkButtonText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 13 },
  linkButtonSecondary: {
    marginTop: 8,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  linkButtonSecondaryText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 13 },
  ufTitle: { marginTop: 12, fontSize: 13, fontWeight: 'bold', color: theme.colors.gray_900 },
  ufRow: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ufChip: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ufChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  ufChipText: { fontSize: 12, color: theme.colors.gray_800, fontWeight: '600' },
  ufChipTextActive: { color: theme.colors.white },
});
