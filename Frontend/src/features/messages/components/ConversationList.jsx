import {
  getFarmPhotos,
  getProfileAvatar,
  getProfile,
} from "@/services/communityStore";
import { getInitials } from "@/utils/textUtils";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { messagesStyles as styles } from "@/features/messages/styles/messages.styles";

export function ConversationList({
  conversations,
  onOpenConversation,
  onLongPress,
  currentUser,
}) {
  const renderConversation = ({ item }) => {
    const lastMessage = item.mensagens[item.mensagens.length - 1];

    // Calcula o nome do contato (outra pessoa)
    const contactUsername =
      item.participants.find(
        (p) => p.toLowerCase() !== currentUser?.username?.toLowerCase()
      ) || item.nome;

    const profile = getProfile(contactUsername);
    const contactName = profile.displayName || contactUsername;

    const contactAvatarUri = getProfileAvatar(contactUsername);
    const contactPhotos = getFarmPhotos(contactUsername);
    const contactPhoto = contactAvatarUri || contactPhotos[0];

    return (
      <TouchableOpacity
        style={styles.conversationRow}
        onPress={() => onOpenConversation(item.id)}
        onLongPress={() => onLongPress(item.id)}
      >
        {contactPhoto ? (
          <Image source={{ uri: contactPhoto }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(contactName)}</Text>
          </View>
        )}
        <View style={styles.conversationContent}>
          <View style={styles.conversationTopLine}>
            <Text style={styles.conversationName}>{contactName}</Text>
            <Text style={styles.conversationTime}>
              {lastMessage?.hora ?? ""}
            </Text>
          </View>
          <View style={styles.conversationBottomLine}>
            <Text style={styles.conversationPreview} numberOfLines={1}>
              {lastMessage?.texto ?? "Sem mensagens"}
            </Text>
            {item.unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unread > 9 ? "9+" : item.unread}
                </Text>
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
          <Text style={styles.emptySearchText}>
            Nenhuma conversa encontrada
          </Text>
        </View>
      }
    />
  );
}
