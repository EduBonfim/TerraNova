import React from "react";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { messagesStyles as styles } from "@/features/messages/styles/messages.styles";

export function ChatHeader({
  conversaAtual,
  sellerName,
  sellerHeaderPhotoUri,
  dealClosed,
  isSearchOpen,
  searchQuery,
  onBack,
  onToggleSearch,
  onSearchChange,
  onCloseDealClick,
}) {
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>

        {conversaAtual ? (
          <Image
            source={{ uri: sellerHeaderPhotoUri }}
            style={styles.headerAvatarImage}
          />
        ) : null}

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {conversaAtual ? sellerName || conversaAtual.nome : "Mensagens"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {conversaAtual
              ? conversaAtual.status
              : "Organize suas conversas por contato"}
          </Text>
        </View>

        {conversaAtual ? (
          <TouchableOpacity
            style={[
              styles.closeDealButton,
              dealClosed && styles.closeDealButtonDisabled,
            ]}
            onPress={onCloseDealClick}
            disabled={dealClosed}
          >
            <Ionicons
              name={
                dealClosed
                  ? "checkmark-done-circle"
                  : "checkmark-circle-outline"
              }
              size={20}
              color={theme.colors.white}
            />
            <Text style={styles.closeDealButtonText}>
              {dealClosed ? "Compra fechada" : "Fechar compra"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.searchToggleButton}
            onPress={onToggleSearch}
          >
            <Ionicons
              name={isSearchOpen ? "close" : "search"}
              size={22}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        )}
      </View>

      {!conversaAtual && isSearchOpen ? (
        <View style={styles.searchBarWrap}>
          <Ionicons name="search" size={16} color={theme.colors.gray_500} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Buscar contato ou mensagem"
            placeholderTextColor={theme.colors.placeholder}
            autoFocus
          />
        </View>
      ) : null}
    </>
  );
}
