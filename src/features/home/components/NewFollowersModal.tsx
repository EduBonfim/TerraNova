import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { getMockFollowers } from "@/services/followStore";

interface NewFollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewFollowersModal({ isOpen, onClose }: NewFollowersModalProps) {
  const newFollowers = getMockFollowers();

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Novos Seguidores</Text>
              <Text style={styles.subtitle}>Veja quem começou a te acompanhar</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.gray_800} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {newFollowers.map((follower) => (
              <View key={follower.id} style={styles.followerItem}>
                <Image source={{ uri: follower.avatar }} style={styles.avatar} />
                <View style={styles.info}>
                  <Text style={styles.name}>{follower.name}</Text>
                  <Text style={styles.type}>{follower.type}</Text>
                </View>
                <View style={styles.timeTag}>
                  <Text style={styles.timeText}>Recente</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={styles.actionButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    maxHeight: "70%",
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_100,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.gray_900,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.gray_500,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  list: {
    padding: 16,
  },
  followerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_50,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.gray_100,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.gray_900,
  },
  type: {
    fontSize: 13,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
  timeTag: {
    backgroundColor: theme.colors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    margin: 20,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
