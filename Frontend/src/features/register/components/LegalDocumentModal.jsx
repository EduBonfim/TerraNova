import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Margem (px) para considerar que o usuário chegou ao final do texto.
const END_REACHED_THRESHOLD = 24;

function DocumentParagraph({ text }) {
  if (text.startsWith("• ")) {
    return (
      <View style={styles.bulletRow}>
        <Text style={styles.bulletMark}>•</Text>
        <Text style={styles.bulletText}>{text.slice(2)}</Text>
      </View>
    );
  }
  return <Text style={styles.paragraph}>{text}</Text>;
}

/**
 * Corpo do documento. É montado a cada abertura do Modal, então o estado de
 * leitura (chegou ao final / progresso) sempre reinicia do zero.
 */
function LegalDocumentBody({
  document,
  version,
  onClose,
  onAccept,
  acceptLabel,
}) {
  const [reachedEnd, setReachedEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  const layoutHeight = useRef(0);
  const contentHeight = useRef(0);

  const evaluate = (offsetY) => {
    const viewport = layoutHeight.current;
    const content = contentHeight.current;
    if (!viewport || !content) return;

    const maxScroll = Math.max(content - viewport, 0);
    if (maxScroll <= END_REACHED_THRESHOLD) {
      // Documento cabe inteiro na tela: não há o que rolar.
      setProgress(1);
      setReachedEnd(true);
      return;
    }

    setProgress(Math.min(Math.max(offsetY / maxScroll, 0), 1));
    if (offsetY >= maxScroll - END_REACHED_THRESHOLD) {
      setReachedEnd(true);
    }
  };

  const handleScroll = (event) => {
    evaluate(event.nativeEvent.contentOffset.y);
  };

  const percent = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTextBox}>
          <Text style={styles.title} accessibilityRole="header">
            {document.title}
          </Text>
          <Text style={styles.version}>Versão {version}</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessibilityLabel="Fechar documento"
        >
          <Ionicons name="close" size={24} color={theme.colors.gray_800} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onLayout={(e) => {
          layoutHeight.current = e.nativeEvent.layout.height;
          evaluate(0);
        }}
        onContentSizeChange={(_w, h) => {
          contentHeight.current = h;
          evaluate(0);
        }}
      >
        <Text style={styles.intro}>{document.intro}</Text>

        {document.sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.paragraphs.map((paragraph, index) => (
              <DocumentParagraph
                key={`${section.title}-${index}`}
                text={paragraph}
              />
            ))}
          </View>
        ))}

        <View style={styles.closingBox}>
          <Ionicons
            name="checkmark-done-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.closingText}>{document.closing}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {reachedEnd ? (
          <View style={styles.hintRow}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.green_500}
            />
            <Text style={[styles.hintText, styles.hintTextDone]}>
              Leitura concluída. Você já pode aceitar.
            </Text>
          </View>
        ) : (
          <View style={styles.hintRow}>
            <Ionicons
              name="arrow-down-circle-outline"
              size={16}
              color={theme.colors.gray_500}
            />
            <Text style={styles.hintText}>
              Role até o final para liberar o botão ({percent}%)
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.declineText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptButton, !reachedEnd && styles.acceptDisabled]}
            onPress={onAccept}
            disabled={!reachedEnd}
            accessibilityRole="button"
            accessibilityState={{ disabled: !reachedEnd }}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={theme.colors.white}
              style={styles.acceptIcon}
            />
            <Text style={styles.acceptText}>{acceptLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/**
 * Janela flutuante que exibe um documento legal e só habilita o botão de
 * aceite depois que o usuário rolar o texto até o final.
 */
export function LegalDocumentModal({
  visible,
  document,
  version,
  onClose,
  onAccept,
  acceptLabel = "Aceito",
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <LegalDocumentBody
          document={document}
          version={version}
          onClose={onClose}
          onAccept={onAccept}
          acceptLabel={acceptLabel}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 18,
    maxHeight: "90%",
    flexShrink: 1,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTextBox: { flex: 1, paddingRight: 8 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.gray_900,
  },
  version: {
    marginTop: 2,
    fontSize: 12,
    color: theme.colors.gray_500,
  },
  closeButton: { padding: 6 },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.gray_200,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  scroll: { flexGrow: 0, flexShrink: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.gray_800,
    marginBottom: 14,
  },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.gray_700,
    marginBottom: 6,
    textAlign: "justify",
  },
  bulletRow: {
    flexDirection: "row",
    paddingLeft: 8,
    marginBottom: 4,
  },
  bulletMark: {
    width: 14,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.primary,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.gray_700,
  },
  closingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.lightGreen,
  },
  closingText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    gap: 12,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    color: theme.colors.gray_500,
  },
  hintTextDone: {
    color: theme.colors.green_500,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  declineButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    alignItems: "center",
    justifyContent: "center",
  },
  declineText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.gray_700,
  },
  acceptButton: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  acceptDisabled: {
    backgroundColor: theme.colors.gray_300,
  },
  acceptIcon: { marginRight: 6 },
  acceptText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.white,
  },
});
