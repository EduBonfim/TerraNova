import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const AdminTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "home", label: "Inicio", icon: "grid" },
    { id: "sales", label: "Vendas", icon: "cart" },
    { id: "metrics", label: "BI", icon: "bar-chart" },
    { id: "reports", label: "Denuncias", icon: "flag" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.icon : `${tab.icon}-outline`}
              size={24}
              color={
                isActive ? theme.colors.orange_500 : "rgba(223, 223, 223, 0.8)"
              }
            />
            <Text
              style={[
                styles.label,
                {
                  color: isActive
                    ? theme.colors.orange_500
                    : "rgba(223, 223, 223, 0.8)",
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 88 : 68,
    backgroundColor: theme.colors.primary,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },
});
