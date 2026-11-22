import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { homeStyles as styles } from "@/features/home/styles/home.styles";

export function NotificationsModal({
  isNotificationsOpen,
  closeNotifications,
  latestNotifications,
  _hasMoreNotifications,
  openNotificationTarget,
  openAllNotifications,
}) {
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

          {latestNotifications.length > 0 ? (
            latestNotifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.notificationItem}
                onPress={() => openNotificationTarget(item)}
              >
                <View style={styles.notificationDotWrap}>
                  <View
                    style={[
                      styles.notificationDot,
                      item.isNew
                        ? styles.notificationDotNew
                        : styles.notificationDotRead,
                    ]}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationItemTitle}>{item.title}</Text>
                  <Text style={styles.notificationItemDescription}>
                    {item.description}
                  </Text>
                </View>
                <Text style={styles.notificationItemTime}>{item.time}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyNotifications}>
              <Ionicons
                name="notifications-off-outline"
                size={32}
                color={theme.colors.gray_300}
              />
              <Text style={styles.emptyNotificationsText}>
                Nenhuma novidade no momento
              </Text>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={openAllNotifications}
              >
                <Text style={styles.historyButtonText}>
                  Ver notificações anteriores
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
