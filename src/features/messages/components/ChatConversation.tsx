import React from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { messagesStyles as styles, CURRENT_PLATFORM_UI } from "../styles/messages.styles";
import { ChatMessage } from "../hooks/useChatLogic";

interface ChatConversationProps {
  messages: ChatMessage[];
  sellerName: string;
  isKeyboardVisible: boolean;
  newMessage: string;
  insetsBottom: number;
  onNewMessageChange: (val: string) => void;
  onSendMessage: () => void;
  onViewProfile: () => void;
}

export function ChatConversation({
  messages,
  sellerName,
  isKeyboardVisible,
  newMessage,
  insetsBottom,
  onNewMessageChange,
  onSendMessage,
  onViewProfile
}: ChatConversationProps) {
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.remetente === "me";
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

  return (
    <>
      <TouchableOpacity style={styles.profileShortcut} onPress={onViewProfile}>
        <Ionicons name="person-circle-outline" size={18} color={theme.colors.primary} />
        <Text style={styles.profileShortcutText}>Ver perfil do contato</Text>
      </TouchableOpacity>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[styles.chatContainer, { paddingBottom: CURRENT_PLATFORM_UI.chatListBottomPadding }]}
      />

      <View style={[
        styles.inputContainer,
        { marginBottom: isKeyboardVisible ? 0 : Math.max(insetsBottom, 12) }
      ]}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem"
          placeholderTextColor={theme.colors.gray_500}
          value={newMessage}
          onChangeText={onNewMessageChange}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, newMessage.trim() === "" ? styles.sendButtonDisabled : null]}
          onPress={onSendMessage}
          disabled={newMessage.trim() === ""}
        >
          <Ionicons name="send" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </>
  );
}
