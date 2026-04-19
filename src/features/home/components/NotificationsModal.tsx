import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { homeStyles as styles } from "../styles/home.styles";
import type { AppNotification } from "@/services/notificationsStore";

interface NotificationsModalProps {
  isNotificationsOpen: boolean;
  closeNotifications: () => void;
  latestNotifications: AppNotification[];
  hasMoreNotifications: boolean;
  openNotificationTarget: (item: AppNotification) => void;
  openAllNotifications: () => void;
}

export function NotificationsModal({
  isNotificationsOpen,
  closeNotifications,
  latestNotifications,
  hasMoreNotifications,
  openNotificationTarget,
  openAllNotifications,
}: NotificationsModalProps) {
  return (
    <Modal
      visible={isNotificationsOpen}
      transparent
      animationType="fade"
      onRequestClose={closeNotifications}
    >
      <Pressable style={styles.modalBackdrop} onPress={closeNotifications}>
        <Pressable style={styles.notificationsPanel} onPress={() => {}}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Novidades</Text>
            <TouchableOpacity onPress={closeNotifications}>
              <Ionicons name="close" size={20} color={theme.colors.gray_800} />
            </TouchableOpacity>
          </View>

          {latestNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.notificationItem}
              onPress={() => openNotificationTarget(item)}
            >
              <View style={styles.notificationDotWrap}>
                <View
                  style={[
                    styles.notificationDot,
                    item.isNew ? styles.notificationDotNew : styles.notificationDotRead,
                  ]}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationItemTitle}>{item.title}</Text>
                <Text style={styles.notificationItemDescription}>{item.description}</Text>
              </View>
              <Text style={styles.notificationItemTime}>{item.time}</Text>
            </TouchableOpacity>
          ))}

          {hasMoreNotifications ? (
            <TouchableOpacity
              style={styles.viewAllNotificationsButton}
              onPress={openAllNotifications}
            >
              <Text style={styles.viewAllNotificationsText}>Ver todas as notificacoes</Text>
            </TouchableOpacity>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
