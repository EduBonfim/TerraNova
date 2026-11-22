import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Linking, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { homeStyles as styles } from "@/features/home/styles/home.styles";
import { SurfaceCard } from "@/components/SurfaceCard";
import { fetchAgroNews } from "@/services/newsStore";

export function AgroNews() {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    fetchAgroNews().then(setNewsList);
  }, []);

  const openLink = (url) => {
    Linking.openURL(url).catch(console.error);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notícias e Destaques (Agro)</Text>

      {newsList.length > 0 ? (
        newsList.slice(0, 3).map((news) => (
          <TouchableOpacity
            key={news.id}
            activeOpacity={0.8}
            onPress={() => openLink(news.link)}
          >
            <SurfaceCard style={styles.newsCard} bordered={false}>
              {news.imageUrl ? (
                <Image
                  source={{ uri: news.imageUrl }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    marginRight: 16,
                  }}
                />
              ) : (
                <View style={styles.newsImagePlaceholder}>
                  <Ionicons
                    name="newspaper-outline"
                    size={32}
                    color={theme.colors.gray_500}
                  />
                </View>
              )}
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle} numberOfLines={2}>
                  {news.title}
                </Text>
                <Text style={styles.newsSource}>
                  {news.source} • {news.date}
                </Text>
              </View>
            </SurfaceCard>
          </TouchableOpacity>
        ))
      ) : (
        <SurfaceCard style={styles.newsCard} bordered={false}>
          <View style={styles.newsImagePlaceholder}>
            <Ionicons name="earth" size={32} color={theme.colors.gray_500} />
          </View>
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>
              Nenhuma notícia carregada no momento
            </Text>
            <Text style={styles.newsSource}>Verifique sua conexão</Text>
          </View>
        </SurfaceCard>
      )}
    </View>
  );
}
