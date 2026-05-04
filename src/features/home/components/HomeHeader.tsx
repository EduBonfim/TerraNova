import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { homeStyles as styles } from "@/features/home/styles/home.styles";

interface HomeHeaderProps {
  profileSummary: {
    avatarUri?: string;
    displayName: string;
    farmName: string;
  };
  unreadCount: number;
  openNotifications: () => void;
}

export function HomeHeader({ profileSummary, unreadCount, openNotifications }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <Image
          source={
            profileSummary.avatarUri
              ? { uri: `${profileSummary.avatarUri}?t=${new Date().getTime()}` }
              : require("../../../assets/perfil.png")
          }
          style={styles.avatar}
        />
        <View>
          <Text style={styles.greeting}>Olá, {profileSummary.displayName}</Text>
          <Text style={styles.location}>
            <Ionicons name="location" size={12} color={theme.colors.primary} />{" "}
            {profileSummary.farmName}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.notificationIcon} onPress={openNotifications}>
        <Ionicons name="notifications-outline" size={24} color={theme.colors.gray_900} />
        {unreadCount > 0 ? (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}
