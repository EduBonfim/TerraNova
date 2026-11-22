import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/services/cartStore";
import {
  fetchProfile,
  getAverageRating,
  getProfile,
  getReviews,
  refreshReviewsRemote,
} from "@/services/communityStore";
import {
  isFollowing as checkIsFollowing,
  getFollowerCount,
  getFollowingCount,
  initFollowStore,
  toggleFollow,
} from "@/services/followStore";
import { getMarketplaceItems } from "@/services/marketplaceStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import SafeMapView, {
  SafeMarker,
  SafePolyline,
} from "@/components/SafeMapView";
import * as Location from "expo-location";
import { getDistanceKm, formatDistanceLabel } from "@/utils/geoUtils";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReportModal } from "@/features/messages/components/ReportModal";
import { FertilizersList } from "@/features/user-profile/components/FertilizersList";
import { HeroBanner } from "@/features/user-profile/components/HeroBanner";
import { ImagePreviewModal } from "@/features/user-profile/components/ImagePreviewModal";
import { MarketListings } from "@/features/user-profile/components/MarketListings";
import { PhotoGallery } from "@/features/user-profile/components/PhotoGallery";
import { ProductDetailsModal } from "@/features/user-profile/components/ProductDetailsModal";
import { ProfileMainInfo } from "@/features/user-profile/components/ProfileMainInfo";
import { ProfileQuickActions } from "@/features/user-profile/components/ProfileQuickActions";
import { ProfileTrustStats } from "@/features/user-profile/components/ProfileTrustStats";
import { RecentReviews } from "@/features/user-profile/components/RecentReviews";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function UserProfileScreen() {
  const router = useRouter();
  const {
    cartItems: _cartItems,
    vendorName: _vendorName,
    totalItems: _totalItems,
  } = useCart();
  const { user: currentUser } = useAuth();
  const params = useLocalSearchParams();
  // Se não vier nome, não assume uma fazenda genérica, pega o usuário logado para fallback seguro, ou vazio.
  const name =
    params.filterByVendor || params.name || currentUser?.username || "";

  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [animatedLineCoords, setAnimatedLineCoords] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [profileData, setProfileData] = useState(getProfile(name));

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadListings = async () => {
        const items = await getMarketplaceItems();
        if (mounted) {
          setMarketplaceItems(items);
        }
      };

      void loadListings();
      void refreshReviewsRemote(name);

      // Carregar perfil completo do backend
      fetchProfile(name).then((res) => {
        if (res && mounted) setProfileData(res);
      });

      return () => {
        mounted = false;
      };
    }, [name])
  );

  useEffect(() => {
    if (currentUser?.username) {
      initFollowStore(currentUser.username).then(async () => {
        setIsFollowing(checkIsFollowing(name));
        const count = await getFollowerCount(name);
        setFollowerCount(count);
        setFollowingCount(getFollowingCount(currentUser.username));
      });
    }
  }, [name, currentUser]);

  const profile = profileData;
  const rating = getAverageRating(name);
  const reviews = getReviews(name);
  const isOwnProfile =
    normalizeText(profile.username) ===
    normalizeText(currentUser?.username || "");

  const userListings = useMemo(() => {
    const target = normalizeText(profile.username || name);
    return marketplaceItems.filter((item) => {
      const isTargetVendor =
        normalizeText(item.vendedor || "") === target ||
        normalizeText(item.vendedorUsername || "") === target;
      if (!isTargetVendor) return false;

      // Hide "Cultivo" items from buyers
      if (currentUser?.role === "buyer" && item.categoria === "Cultivo") {
        return false;
      }

      return true;
    });
  }, [marketplaceItems, profile.username, name, currentUser?.role]);

  const handleReport = () => {
    setReportModalVisible(true);
  };

  const handleToggleFollow = async () => {
    const newState = await toggleFollow(name);
    setIsFollowing(newState);
    // Atualiza o contador de seguidores em tempo real
    const count = await getFollowerCount(name);
    setFollowerCount(count);
  };

  const navigateToMarket = (prod) => {
    setSelectedProduct(null);
    const targetPath =
      currentUser?.role === "buyer"
        ? "/(buyer)/marketplace"
        : "/(producer)/profile";
    router.push({
      pathname: targetPath,
      params: { filterByVendor: prod.vendedor, highlight: prod.id },
    });
  };

  const handleOpenLocation = async () => {
    setIsMapModalVisible(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationError("Permissão de localização negada");
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    } catch (_e) {
      setLocationError("Não foi possível obter sua localização");
    }
  };

  const distanceKm =
    userLocation && profile.gateLatitude && profile.gateLongitude
      ? getDistanceKm(
          {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          },
          { latitude: profile.gateLatitude, longitude: profile.gateLongitude }
        )
      : null;

  useEffect(() => {
    if (
      isMapModalVisible &&
      userLocation &&
      profile.gateLatitude &&
      profile.gateLongitude
    ) {
      const start = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };
      const end = {
        latitude: profile.gateLatitude,
        longitude: profile.gateLongitude,
      };

      const steps = 30;
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep > steps) {
          clearInterval(interval);
          return;
        }

        const newCoords = [];
        for (let i = 0; i <= currentStep; i++) {
          const fraction = i / steps;
          newCoords.push({
            latitude:
              start.latitude + (end.latitude - start.latitude) * fraction,
            longitude:
              start.longitude + (end.longitude - start.longitude) * fraction,
          });
        }

        setAnimatedLineCoords(newCoords);
        currentStep++;
      }, 40);

      return () => clearInterval(interval);
    } else {
      setAnimatedLineCoords([]);
    }
  }, [
    isMapModalVisible,
    userLocation,
    profile.gateLatitude,
    profile.gateLongitude,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <HeroBanner
          farmPhotos={profile.farmPhotos}
          avatarUri={profile.avatarUri}
          onBackPress={() => router.back()}
        />

        <ProfileMainInfo
          displayName={profile.displayName}
          farmName={profile.farmName}
          producerRole={profile.producerRole}
          isCepValidated={profile.isCepValidated}
          followerCount={followerCount}
          followingCount={followingCount}
        />

        <ProfileQuickActions
          onNegotiate={() =>
            router.push({
              pathname: "/messages",
              params: {
                sellerName: profile.username,
                productName: "Conversa Direta",
              },
            })
          }
          farmAddress={profile.farmAddress}
          latitude={profile.gateLatitude}
          longitude={profile.gateLongitude}
          isFollowing={isFollowing}
          onToggleFollow={handleToggleFollow}
          currentUserRole={currentUser?.role}
          isOwnProfile={isOwnProfile}
          onOpenLocation={handleOpenLocation}
        />

        <ProfileTrustStats
          salesCount={reviews.length}
          rating={rating}
          certificatesCount={profile.certificates.length || 0}
          bio={profile.bio}
          isCepValidated={profile.isCepValidated}
          isGatePinConfirmed={profile.isGatePinConfirmed || false}
          locationValidatedAt={profile.locationValidatedAt}
        />

        <PhotoGallery
          farmPhotos={profile.farmPhotos}
          onPhotoPress={(uri) => setPreviewPhoto(uri)}
        />

        <MarketListings
          userListings={userListings}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        <FertilizersList insumos={profile.insumos} />

        <RecentReviews
          reviews={reviews.map((r) => ({
            id: r.id,
            author: r.author || r.authorName || r.authorUsername || "Anônimo",
            date: r.date,
            stars: r.stars,
            comment: r.comment,
          }))}
        />

        {!isOwnProfile && (
          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Ionicons
              name="flag-outline"
              size={16}
              color={theme.colors.red_500}
            />
            <Text style={styles.reportButtonText}>
              Denunciar Perfil ou Anúncio Irregular
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ImagePreviewModal
        previewPhoto={previewPhoto}
        onClose={() => setPreviewPhoto(null)}
      />

      <Modal visible={isMapModalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.white,
              height: "80%",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                padding: 16,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: theme.colors.primary,
              }}
            >
              <Text
                style={{
                  color: theme.colors.white,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Localização da Propriedade
              </Text>
              <TouchableOpacity onPress={() => setIsMapModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.white} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16, backgroundColor: theme.colors.white }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: theme.colors.gray_900,
                }}
              >
                {profile.farmName || profile.displayName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.gray_600,
                  marginTop: 4,
                }}
              >
                {profile.farmAddress}
              </Text>

              {distanceKm !== null ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                    backgroundColor: theme.colors.orange_500 + "15",
                    padding: 8,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                  }}
                >
                  <Ionicons
                    name="navigate-circle"
                    size={16}
                    color={theme.colors.orange_500}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: theme.colors.orange_500,
                      fontWeight: "bold",
                      fontSize: 13,
                    }}
                  >
                    {formatDistanceLabel(distanceKm)}
                  </Text>
                </View>
              ) : locationError ? (
                <Text
                  style={{
                    color: theme.colors.red_500,
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  {locationError}
                </Text>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ color: theme.colors.gray_500, fontSize: 12 }}>
                    Calculando distância...
                  </Text>
                </View>
              )}
            </View>

            {profile.gateLatitude && profile.gateLongitude ? (
              <SafeMapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: userLocation
                    ? (profile.gateLatitude + userLocation.coords.latitude) / 2
                    : profile.gateLatitude,
                  longitude: userLocation
                    ? (profile.gateLongitude + userLocation.coords.longitude) /
                      2
                    : profile.gateLongitude,
                  latitudeDelta: userLocation
                    ? Math.max(
                        Math.abs(
                          profile.gateLatitude - userLocation.coords.latitude
                        ) * 1.5,
                        0.05
                      )
                    : 0.05,
                  longitudeDelta: userLocation
                    ? Math.max(
                        Math.abs(
                          profile.gateLongitude - userLocation.coords.longitude
                        ) * 1.5,
                        0.05
                      )
                    : 0.05,
                }}
              >
                <SafeMarker
                  coordinate={{
                    latitude: profile.gateLatitude,
                    longitude: profile.gateLongitude,
                  }}
                  title={profile.farmName || profile.displayName}
                  description={profile.farmAddress}
                />
                {userLocation && (
                  <SafeMarker
                    coordinate={{
                      latitude: userLocation.coords.latitude,
                      longitude: userLocation.coords.longitude,
                    }}
                    title="Você está aqui"
                    pinColor="blue"
                  />
                )}
                {animatedLineCoords.length > 0 && (
                  <SafePolyline
                    coordinates={animatedLineCoords}
                    strokeColor={theme.colors.orange_500}
                    strokeWidth={4}
                    lineDashPattern={[10, 10]}
                  />
                )}
              </SafeMapView>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme.colors.gray_100,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={48}
                  color={theme.colors.gray_400}
                />
                <Text style={{ color: theme.colors.gray_500, marginTop: 12 }}>
                  Coordenadas GPS não informadas pelo produtor.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <ProductDetailsModal
        selectedProduct={selectedProduct}
        currentUserRole={currentUser?.role}
        currentUsername={currentUser?.username}
        onClose={() => setSelectedProduct(null)}
        onNavigateToMarket={navigateToMarket}
      />

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        reportedUserName={name}
      />
    </SafeAreaView>
  );
}
