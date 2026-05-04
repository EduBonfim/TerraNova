import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/services/cartStore";
import {
    getAverageRating,
    getProfile,
    getReviews,
} from "@/services/communityStore";
import { MARKETPLACE_OPPORTUNITIES } from "@/services/marketplaceStore";
import { appTheme as theme } from "@/theme/appTheme";
import { initFollowStore, isFollowing as checkIsFollowing, toggleFollow, getFollowerCount, getFollowingCount } from "@/services/followStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";
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

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function UserProfileScreen() {
  const router = useRouter();
  const { cartItems, vendorName: cartVendorName, totalItems } = useCart();
  const { user: currentUser } = useAuth();
  const params = useLocalSearchParams<{
    name?: string;
    filterByVendor?: string;
  }>();
  const name = params.filterByVendor || params.name || "Fazenda São João";

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (currentUser?.username) {
      initFollowStore(currentUser.username).then(async () => {
        setIsFollowing(checkIsFollowing(name));
        const count = await getFollowerCount(name);
        setFollowerCount(count);
        setFollowingCount(getFollowingCount(currentUser.username!));
      });
    }
  }, [name, currentUser]);

  const profile = getProfile(name);
  const rating = getAverageRating(name);
  const reviews = getReviews(name);

  const userListings = MARKETPLACE_OPPORTUNITIES.filter(
    (item) => normalizeText(item.vendedor) === normalizeText(name),
  );

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

  const navigateToMarket = (prod: any) => {
    setSelectedProduct(null);
    const targetPath =
      currentUser?.role === "buyer"
        ? "/(buyer)/marketplace"
        : "/(producer)/profile";
    router.push({
      pathname: targetPath as any,
      params: { filterByVendor: prod.vendedor, highlight: prod.id },
    });
  };

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

        <RecentReviews reviews={reviews} />

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

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ImagePreviewModal
        previewPhoto={previewPhoto}
        onClose={() => setPreviewPhoto(null)}
      />

      <ProductDetailsModal
        selectedProduct={selectedProduct}
        currentUserRole={currentUser?.role}
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
