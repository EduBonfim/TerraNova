import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addCertificate, CertificateStatus, getCertificates } from '../services/communityStore';

type ViewStatus = 'create' | CertificateStatus;

const theme = {
  colors: {
    primary: '#6B8E23',
    white: '#FFFFFF',
    background: '#F5F5F5',
    gray_200: '#E5E7EB',
    gray_300: '#D1D5DB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
    green_600: '#2E7D32',
    amber_600: '#B45309',
  },
};

export default function CertificatesScreen() {
  const router = useRouter();
  const profileName = 'Pedro Paulo';
  const [status, setStatus] = useState<ViewStatus>('create');
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [verification, setVerification] = useState('');
  const [refresh, setRefresh] = useState(0);

  const currentCertificates = useMemo(() => {
    if (status === 'create') return [];
    return getCertificates(profileName, status);
  }, [profileName, refresh, status]);

  const onAddCertificate = () => {
    if (!title.trim() || !number.trim() || !issuer.trim() || !issueDate.trim() || !expiryDate.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha título, número, órgão emissor, emissão e validade.');
      return;
    }

    addCertificate(profileName, {
      title: title.trim(),
      number: number.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate.trim(),
      expiryDate: expiryDate.trim(),
      verification: verification.trim() || 'Não informado',
      status: 'pending',
    });

    setTitle('');
    setNumber('');
    setIssuer('');
    setIssueDate('');
    setExpiryDate('');
    setVerification('');
    setStatus('pending');
    setRefresh((prev) => prev + 1);
    Alert.alert('Sucesso', 'Certificado adicionado ao seu perfil.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/account')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Certificados MAPA</Text>
          <Text style={styles.headerSubtitle}>Gestão de conformidade e confiança</Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.stateTabs}>
          <TouchableOpacity style={[styles.stateTab, status === 'create' && styles.stateTabActive]} onPress={() => setStatus('create')}>
            <Text style={[styles.stateTabText, status === 'create' && styles.stateTabTextActive]}>Cadastrar novo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.stateTab, status === 'pending' && styles.stateTabActive]} onPress={() => setStatus('pending')}>
            <Text style={[styles.stateTabText, status === 'pending' && styles.stateTabTextActive]}>Em análise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.stateTab, status === 'approved' && styles.stateTabActive]} onPress={() => setStatus('approved')}>
            <Text style={[styles.stateTabText, status === 'approved' && styles.stateTabTextActive]}>Aprovado</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Porque cadastrar seus certificados?</Text>
          <Text style={styles.infoText}>• Reforçar credibilidade comercial no seu perfil público.</Text>
          <Text style={styles.infoText}>• Centralizar documentos para acelerar negociações no chat.</Text>
          <Text style={styles.infoText}>• Controlar vigência e status dos certificados oficiais.</Text>
        </View>

        {status === 'create' ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Adicionar certificado</Text>

            <TextInput
              style={styles.input}
              placeholder="Tipo do certificado"
              placeholderTextColor={theme.colors.gray_500}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Número do documento"
              placeholderTextColor={theme.colors.gray_500}
              value={number}
              onChangeText={setNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Órgão emissor"
              placeholderTextColor={theme.colors.gray_500}
              value={issuer}
              onChangeText={setIssuer}
            />
            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Emissão (dd/mm/aaaa)"
                placeholderTextColor={theme.colors.gray_500}
                value={issueDate}
                onChangeText={setIssueDate}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Validade (dd/mm/aaaa)"
                placeholderTextColor={theme.colors.gray_500}
                value={expiryDate}
                onChangeText={setExpiryDate}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Link de verificação (opcional)"
              placeholderTextColor={theme.colors.gray_500}
              value={verification}
              onChangeText={setVerification}
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.addButton} onPress={onAddCertificate}>
              <Ionicons name="add-circle-outline" size={18} color={theme.colors.white} />
              <Text style={styles.addButtonText}>Salvar certificado</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {(status === 'pending' || status === 'approved') && currentCertificates.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-outline" size={24} color={theme.colors.gray_500} />
            <Text style={styles.emptyTitle}>Nenhum certificado nesse estado</Text>
            <Text style={styles.emptyText}>Use a aba "Cadastrar novo" para adicionar um certificado e definir o status inicial.</Text>
          </View>
        ) : null}

        {currentCertificates.map((item) => (
          <View key={item.id} style={styles.certificateCard}>
            <View style={styles.certificateHeader}>
              <Text style={styles.certificateTitle}>{item.title}</Text>
              <View style={[styles.badge, status === 'approved' ? styles.badgeApproved : styles.badgePending]}>
                <Text style={styles.badgeText}>{status === 'approved' ? 'Ativo' : 'Em análise'}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Número:</Text>
              <Text style={styles.metaValue}>{item.number}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Órgão emissor:</Text>
              <Text style={styles.metaValue}>{item.issuer}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Emissão:</Text>
              <Text style={styles.metaValue}>{item.issueDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Validade:</Text>
              <Text style={styles.metaValue}>{item.expiryDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Verificação:</Text>
              <Text style={styles.metaLink}>{item.verification}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { padding: 16, paddingBottom: 30 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 16,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  backButton: { marginRight: 10, padding: 4 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.white },
  headerSubtitle: { fontSize: 13, color: theme.colors.white, marginTop: 2 },
  stateTabs: { flexDirection: 'row', backgroundColor: theme.colors.white, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.gray_200, padding: 4 },
  stateTab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  stateTabActive: { backgroundColor: theme.colors.primary },
  stateTabText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.gray_500 },
  stateTabTextActive: { color: theme.colors.white },
  infoCard: { marginTop: 12, backgroundColor: theme.colors.white, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.gray_200, padding: 14 },
  infoTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.gray_800, marginBottom: 8 },
  infoText: { fontSize: 13, color: theme.colors.gray_800, lineHeight: 20 },
  formCard: { marginTop: 12, backgroundColor: theme.colors.white, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.gray_200, padding: 14 },
  formTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.gray_800, marginBottom: 10 },
  input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.gray_300, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 10, color: theme.colors.gray_800, marginBottom: 9 },
  rowInputs: { flexDirection: 'row', gap: 8 },
  halfInput: { flex: 1 },
  addButton: { backgroundColor: theme.colors.primary, borderRadius: 10, paddingVertical: 11, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  addButtonText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 13 },
  emptyCard: { marginTop: 12, backgroundColor: theme.colors.white, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.gray_200, padding: 16, alignItems: 'center' },
  emptyTitle: { marginTop: 8, fontSize: 15, fontWeight: 'bold', color: theme.colors.gray_800 },
  emptyText: { marginTop: 4, fontSize: 13, color: theme.colors.gray_500, textAlign: 'center', lineHeight: 19 },
  certificateCard: { marginTop: 12, backgroundColor: theme.colors.white, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.gray_200, padding: 14 },
  certificateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  certificateTitle: { flex: 1, marginRight: 8, fontSize: 15, fontWeight: 'bold', color: theme.colors.gray_800 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeApproved: { backgroundColor: '#E8F5E9' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: theme.colors.gray_800 },
  metaRow: { flexDirection: 'row', marginBottom: 5 },
  metaLabel: { width: 105, fontSize: 12, color: theme.colors.gray_500, fontWeight: 'bold' },
  metaValue: { flex: 1, fontSize: 12, color: theme.colors.gray_800 },
  metaLink: { flex: 1, fontSize: 12, color: theme.colors.primary, textDecorationLine: 'underline' },
});
