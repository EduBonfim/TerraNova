import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";
import { messagesStyles as styles } from "../styles/messages.styles";
import { ContactConversation } from "../hooks/useChatLogic";
import { getFarmPhotos, getProfileAvatar } from "@/services/communityStore";
import { getInitials } from "@/utils/textUtils";

interface ConversationListProps {
  conversations: ContactConversation[];
  onOpenConversation: (id: string) => void;
}

export function ConversationList({ conversations, onOpenConversation }: ConversationListProps) {
  const renderConversation = ({ item }: { item: ContactConversation }) => {
    const lastMessage = item.mensagens[item.mensagens.length - 1];
    const contactAvatarUri = getProfileAvatar(item.nome);
    const contactPhotos = getFarmPhotos(item.nome);
    const contactPhoto = contactAvatarUri || contactPhotos[0] || null;

    return (
      <TouchableOpacity style={styles.conversationRow} onPress={() => onOpenConversation(item.id)}>
        {contactPhoto ? (
          <Image source={{ uri: contactPhoto }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
          </View>
        )}
        <View style={styles.conversationContent}>
          <View style={styles.conversationTopLine}>
            <Text style={styles.conversationName}>{item.nome}</Text>
            <Text style={styles.conversationTime}>{lastMessage?.hora ?? ""}</Text>
          </View>
          <View style={styles.conversationBottomLine}>
            <Text style={styles.conversationPreview} numberOfLines={1}>
              {lastMessage?.texto ?? "Sem mensagens"}
            </Text>
            {item.unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread > 9 ? "9+" : item.unread}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={renderConversation}
      style={styles.conversationList}
      contentContainerStyle={styles.conversationListContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <View style={styles.emptySearchState}>
          <Text style={styles.emptySearchText}>Nenhuma conversa encontrada</Text>
        </View>
      }
    />
  );
}
