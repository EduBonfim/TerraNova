import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CURRENT_PLATFORM_UI,
  messagesStyles as styles,
} from "@/features/messages/styles/messages.styles";
import { ReportModal } from "@/features/messages/components/ReportModal";

export function ChatConversation({
  messages,
  sellerName,
  isKeyboardVisible,
  newMessage,
  insetsBottom,
  onNewMessageChange,
  onSendMessage,
  onViewProfile,
  isReceiverBlockingMessages,
  currentUser,
}) {
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const handleBlockedButtonPress = () => {
    Alert.alert(
      "Mensagem Bloqueada",
      `${sellerName} optou por não receber mensagens diretas.`,
      [{ text: "OK" }]
    );
  };

  const renderMessage = ({ item }) => {
    const isMe =
      item.remetente === currentUser?.username || item.remetente === "me";
    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        <View
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextMe : styles.messageTextOther,
            ]}
          >
            {item.texto}
          </Text>
          <Text
            style={[
              styles.timeText,
              isMe ? styles.timeTextMe : styles.timeTextOther,
            ]}
          >
            {item.hora}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.profileShortcutContainer}>
        <TouchableOpacity
          style={styles.profileShortcut}
          onPress={onViewProfile}
        >
          <Ionicons
            name="person-circle-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.profileShortcutText}>Ver perfil do contato</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => setReportModalVisible(true)}
        >
          <Ionicons
            name="flag-outline"
            size={18}
            color={theme.colors.red_500}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.chatContainer,
          { paddingBottom: CURRENT_PLATFORM_UI.chatListBottomPadding },
        ]}
      />

      {isReceiverBlockingMessages && (
        <View style={styles.blockedMessageWarning}>
          <Ionicons name="lock-closed" size={16} color={theme.colors.red_500} />
          <Text style={styles.blockedMessageWarningText}>
            {sellerName} não está recebendo mensagens
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { marginBottom: isKeyboardVisible ? 0 : Math.max(insetsBottom, 12) },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem"
          placeholderTextColor={theme.colors.placeholder}
          value={newMessage}
          onChangeText={onNewMessageChange}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (newMessage.trim() === "" || isReceiverBlockingMessages) &&
              styles.sendButtonDisabled,
            isReceiverBlockingMessages && styles.sendButtonBlocked,
          ]}
          onPress={
            isReceiverBlockingMessages
              ? handleBlockedButtonPress
              : onSendMessage
          }
          disabled={newMessage.trim() === "" && !isReceiverBlockingMessages}
        >
          <Ionicons
            name={isReceiverBlockingMessages ? "lock-closed" : "send"}
            size={20}
            color={
              isReceiverBlockingMessages
                ? theme.colors.gray_500
                : theme.colors.white
            }
          />
        </TouchableOpacity>
      </View>

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        reportedUserName={sellerName}
      />
    </>
  );
}
