import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addReview, getAverageRating, getFarmPhotos, getReviews } from '../services/communityStore';

// 🎨 NOVA PALETA OFICIAL TERRA NOVA
const theme = {
  colors: {
    primary: '#6B8E23',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    background: '#F5F5F5',
    gray_200: '#E5E7EB',
    gray_300: '#D1D5DB',
    gray_500: '#6B7280',
    gray_800: '#1F2937',
  }
};

// 💬 DADOS FAKES DE MENSAGENS (Contexto Agroecológico)
const MENSAGENS_INICIAIS = [
  { 
    id: '1', 
    texto: 'Olá! Vi o anúncio da Cama de Frango. Tem caminhão disponível para entrega no meu sítio?', 
    remetente: 'me', 
    hora: '10:30' 
  },
  { 
    id: '2', 
    texto: 'Bom dia Pedro! Temos sim. A nossa carroçaria é lonada, exatamente como exige a regulamentação do MAPA para o transporte seguro.', 
    remetente: 'other', 
    hora: '10:35' 
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const sellerName = 'Fazenda São João';
  const [mensagens, setMensagens] = useState(MENSAGENS_INICIAIS);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [dealClosed, setDealClosed] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [refresh, setRefresh] = useState(0);

  const sellerPhotos = getFarmPhotos(sellerName);
  const sellerReviews = getReviews(sellerName);
  const sellerRating = getAverageRating(sellerName);

  const enviarMensagem = () => {
    if (novaMensagem.trim() === '') return;
    
    const msg = { 
      id: Math.random().toString(), 
      texto: novaMensagem, 
      remetente: 'me', 
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };

    setMensagens([...mensagens, msg]);
    setNovaMensagem('');
  };

  const renderItem = ({ item }: any) => {
    const isMe = item.remetente === 'me';
    
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
            {item.texto}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.timeTextMe : styles.timeTextOther]}>
            {item.hora}
          </Text>
        </View>
      </View>
    );
  };

  const submitReview = () => {
    if (!comment.trim()) return;

    addReview(sellerName, {
      author: 'Você',
      role: 'cliente',
      stars,
      comment: comment.trim(),
    });

    setComment('');
    setStars(5);
    setRefresh((prev) => prev + 1);
  };

  const handleBack = () => {
    if (dealClosed) {
      setDealClosed(false);
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* --- CABEÇALHO --- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerTitleContainer} onPress={() => router.push({ pathname: '/user-profile', params: { name: sellerName } })}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Fazenda São João</Text>
              <Text style={styles.headerSellerRate}>★ {sellerRating}</Text>
            </View>
            <Text style={styles.headerSubtitle}>Vendedor - Online</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.closeDealButton, dealClosed && styles.closeDealButtonDisabled]}
            onPress={() => setDealClosed(true)}
            disabled={dealClosed}>
            <Ionicons name={dealClosed ? 'checkmark-done-circle' : 'checkmark-circle-outline'} size={20} color={theme.colors.white} />
            <Text style={styles.closeDealButtonText}>{dealClosed ? 'Compra fechada' : 'Fechar compra'}</Text>
          </TouchableOpacity>
        </View>

        {!dealClosed ? (
          <>
            <FlatList 
              data={mensagens} 
              keyExtractor={(item) => item.id} 
              renderItem={renderItem} 
              contentContainerStyle={styles.chatContainer} 
            />

            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input} 
                placeholder="Digite a sua mensagem..." 
                placeholderTextColor={theme.colors.gray_500}
                value={novaMensagem} 
                onChangeText={setNovaMensagem} 
                multiline 
              />
              <TouchableOpacity 
                style={[styles.sendButton, novaMensagem.trim() === '' ? styles.sendButtonDisabled : null]} 
                onPress={enviarMensagem} 
                disabled={novaMensagem.trim() === ''}
              >
                <Ionicons name="send" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <ScrollView style={styles.container} contentContainerStyle={styles.reviewScreenContent}>
            <View style={styles.trustCard} key={refresh}>
              <Text style={styles.trustTitle}>Avaliação da negociação</Text>
              <Text style={styles.trustRating}>
                <Ionicons name="star" size={14} color={theme.colors.primary} /> Nota atual do vendedor: {sellerRating} ({sellerReviews.length} avaliações)
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                {sellerPhotos.map((uri) => (
                  <TouchableOpacity key={uri} onPress={() => setPreviewPhoto(uri)}>
                    <Image source={{ uri }} style={styles.sellerPhoto} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity key={value} onPress={() => setStars(value)}>
                    <Ionicons name={value <= stars ? 'star' : 'star-outline'} size={26} color={theme.colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.reviewInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Escreva um comentário da negociação"
                placeholderTextColor={theme.colors.gray_500}
              />

              <TouchableOpacity style={styles.reviewSubmit} onPress={submitReview}>
                <Text style={styles.reviewSubmitText}>Publicar avaliação</Text>
              </TouchableOpacity>

              {sellerReviews.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.reviewCard}>
                  <Text style={styles.reviewMeta}>{item.author} • {item.role} • {item.date}</Text>
                  <Text style={styles.reviewStars}>{'★'.repeat(item.stars)}{'☆'.repeat(5 - item.stars)}</Text>
                  <Text style={styles.reviewComment}>{item.comment}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <Modal visible={Boolean(previewPhoto)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalClose} onPress={() => setPreviewPhoto(null)}>
            <Ionicons name="close" size={28} color={theme.colors.white} />
          </Pressable>
          {previewPhoto ? <Image source={{ uri: previewPhoto }} style={styles.fullImage} resizeMode="contain" /> : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ESTILOS MANTIDOS INTACTOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    minHeight: 76,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 16, 
    backgroundColor: theme.colors.primary, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.gray_200 
  },
  backButton: { padding: 8, marginRight: 8 },
  headerTitleContainer: { flex: 1 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.white },
  headerSellerRate: { fontSize: 12, color: theme.colors.white, marginLeft: 8, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, color: theme.colors.white },
  closeDealButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 8, paddingVertical: 6, gap: 4 },
  closeDealButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.30)' },
  closeDealButtonText: { color: theme.colors.white, fontSize: 11, fontWeight: 'bold' },
  reviewScreenContent: { padding: 16, paddingBottom: 24 },
  trustCard: { backgroundColor: theme.colors.white, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.gray_200, padding: 12, marginBottom: 14 },
  trustTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.gray_800 },
  trustRating: { fontSize: 13, color: theme.colors.gray_800, marginTop: 4 },
  photoRow: { marginTop: 10, gap: 8 },
  sellerPhoto: { width: 88, height: 68, borderRadius: 8, marginRight: 8 },
  starRow: { flexDirection: 'row', gap: 6, marginTop: 10, marginBottom: 8 },
  reviewInput: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.gray_300, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, color: theme.colors.gray_800 },
  reviewSubmit: { marginTop: 8, backgroundColor: theme.colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  reviewSubmitText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 13 },
  reviewCard: { marginTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.gray_200, paddingTop: 8 },
  reviewMeta: { fontSize: 11, color: theme.colors.gray_500 },
  reviewStars: { fontSize: 12, color: theme.colors.primary, marginTop: 2 },
  reviewComment: { fontSize: 13, color: theme.colors.gray_800, marginTop: 2 },
  chatContainer: { padding: 16, paddingBottom: 20 },
  messageRow: { flexDirection: 'row', marginBottom: 12 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, elevation: 1 },
  bubbleMe: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: theme.colors.white, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTextMe: { color: theme.colors.white },
  messageTextOther: { color: theme.colors.gray_800 },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  timeTextMe: { color: theme.colors.lightGreen },
  timeTextOther: { color: theme.colors.gray_500 },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: theme.colors.white, 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.gray_200, 
    alignItems: 'flex-end' 
  },
  input: { 
    flex: 1, 
    backgroundColor: theme.colors.background, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 12, 
    maxHeight: 100, 
    fontSize: 15,
    color: theme.colors.gray_800
  },
  sendButton: { 
    backgroundColor: theme.colors.primary, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 12, 
    marginBottom: 2 
  },
  sendButtonDisabled: { backgroundColor: theme.colors.gray_300 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: Platform.OS === 'android' ? 32 : 58, right: 18, zIndex: 2, padding: 6 },
  fullImage: { width: '94%', height: '82%' },
});