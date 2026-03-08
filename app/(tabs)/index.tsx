/**
 * Home Tab — Unified Feed + Role-based Dashboard.
 * Redesigned with Tropical Luxury Design System: dark gradient hero header, stat cards, and modern feed.
 */
import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useFeed, useReactMutation, useDashboardMetrics } from '../../src/hooks/useFeed';
import { useJoinTrip } from '../../src/hooks/useTrips';
import { useLedger } from '../../src/hooks/useLedger';
import { useUnreadCount } from '../../src/hooks/useNotifications';
import { FeedCard } from '../../src/components/FeedCard';
import AnimatedPressable from '../../src/components/AnimatedPressable';
import { theme } from '../../src/theme/theme';
import type { FeedItem } from '../../src/types/feed';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';


const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);


const GRADIENT_COLORS = {
  orange: '#FFA16B',
  pink: '#F89ABA',
  teal: '#00C4B3',
  blue: '#97CAEB',
};

// Colors for hard-stop gradient (5 colors for seamless repeat)
const PARADE_COLORS: readonly [string, string, ...string[]] = [
  GRADIENT_COLORS.orange, GRADIENT_COLORS.orange,
  GRADIENT_COLORS.pink, GRADIENT_COLORS.pink,
  GRADIENT_COLORS.teal, GRADIENT_COLORS.teal,
  GRADIENT_COLORS.blue, GRADIENT_COLORS.blue,
  GRADIENT_COLORS.orange, GRADIENT_COLORS.orange,
];

const PARADE_LOCATIONS: readonly [number, number, ...number[]] = [
  0, 0.2,
  0.2, 0.4,
  0.4, 0.6,
  0.6, 0.8,
  0.8, 1,
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [joinedTrips, setJoinedTrips] = useState<Set<string>>(new Set());

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();

  const { data: metrics, isLoading: isMetricsLoading } = useDashboardMetrics();
  const { data: ledger, isLoading: isLedgerLoading } = useLedger();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  const reactMutation = useReactMutation();
  const router = useRouter();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const feedItems: FeedItem[] = (data?.pages?.flatMap((page) => page.data) ?? []).map(item => ({
    ...item,
    has_joined: item.has_joined || (item.reference_id ? joinedTrips.has(item.reference_id) : false),
  }));

  const handleReact = useCallback(
    (itemId: string) => {
      reactMutation.mutate(itemId);
    },
    [reactMutation]
  );

  const handleItemPress = useCallback((item: FeedItem) => {
    console.log('Pressed:', item.id);
  }, []);

  const joinTripMutation = useJoinTrip();
  const handleJoinTrip = useCallback((referenceId: string) => {
    const tripId = Number.parseInt(referenceId, 10);
    if (Number.isNaN(tripId)) return;
    joinTripMutation.mutate(tripId, {
      onSuccess: () => {
        setJoinedTrips(prev => new Set(prev).add(referenceId));
        Alert.alert('Success', 'You have successfully joined the trip!');
      },
      onError: () => {
        Alert.alert('Error', 'Failed to join the trip. It may be full or you have already joined.');
      },
    });
  }, [joinTripMutation]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  // ─── Background Parade Animation ────────────────────────
  const paradeX = useSharedValue(0);

  useEffect(() => {
    paradeX.value = withRepeat(
      withTiming(1, {
        duration: 8000,
        easing: Easing.linear,
      }),
      -1, // infinite
      false // do not reverse
    );
  }, []);

  // ─── Scroll Animation ───────────────────────────────────
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroAnimatedStyle = useAnimatedStyle(() => {
    // Scroll stretch logic
    const height = 200;
    const scrollScale = scrollY.value < 0 ? 1 + Math.abs(scrollY.value) / height : 1;
    const scrollTranslateY = scrollY.value < 0 ? scrollY.value / 2 : 0;

    // Parade slide logic: translate left by 4/5 of the total width
    const paradeTranslateX = -paradeX.value * 400; // Moving across 4 out of 5 screens

    return {
      transform: [
        { translateY: scrollTranslateY },
        { translateX: paradeTranslateX },
        { scaleY: scrollScale },
        { scaleX: scrollScale },
      ],
    };
  });

  // ─── Shimmer Skeleton ───────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={theme.gradients.dark as readonly [string, string, ...string[]]}
          style={styles.heroHeaderLoading}
        >
          <View style={styles.skeletonContainer}>
            {/* Greeting skeleton */}
            <View style={[styles.skeletonBlock, { width: 220, height: 32, marginTop: 60 }]} />
            <View style={[styles.skeletonBlock, { width: 120, height: 16, marginTop: 8 }]} />
          </View>
        </LinearGradient>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 24 }}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.skeletonBlock, { width: 160, height: 180, marginLeft: 20, borderRadius: theme.radius.lg }]} />
          ))}
        </ScrollView>
        {/* Feed skeleton */}
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.skeletonBlock, { height: 120, marginHorizontal: 20, marginTop: 16, borderRadius: theme.radius.lg }]} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.bgPage} />
        <Ionicons name="cloud-offline-outline" size={64} color={theme.colors.textTertiary} />
        <Text style={styles.errorText}>Failed to load feed</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }



  const renderHeader = () => (
    <View style={styles.header}>
      {/* ─── Hero Header ─── */}
      {/* Animated fluid stretch background behind the content */}
      <AnimatedLinearGradient
        colors={PARADE_COLORS}
        locations={PARADE_LOCATIONS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.58 }} // Roughly 120deg angle for horizontal-ish slide
        style={[styles.heroHeaderBackground, { width: '500%' }, heroAnimatedStyle]}
      />
      {/* Colors at 100% opacity — no dark scrim overlay */}
      <View style={styles.heroContentWrapper}>
        <View style={styles.heroContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreeting}>{getGreeting()},{'\n'}{firstName} 👋</Text>
            <Text style={styles.heroDepartment}>{user?.role_name === 'Employee' ? 'Staff Member' : (user?.role_name || 'Staff Member')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.bellIconWrap}>
              <Ionicons name="notifications-outline" size={26} color={theme.colors.white} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatarWrap}>
              <View style={styles.avatarRing}>
                {user?.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{firstName.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── Stat Cards ─── */}
      <View style={styles.statCardsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statCardsContent}
          decelerationRate="fast"
          snapToInterval={172} // 160 width + 12 gap
        >
          {(!isMetricsLoading && metrics?.tripadvisor?.enabled) && (
            <AnimatedPressable scaleTo={0.97}>
              <LinearGradient
                colors={theme.gradients.ocean as readonly [string, string, ...string[]]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.statCard]}
              >
                <FontAwesome5 name="tripadvisor" size={32} color={theme.colors.white} style={styles.cardIcon} />
                <Text style={styles.statLabelWhite}>TRIPADVISOR</Text>
                <Text style={styles.statAmountWhite}>
                  #{metrics.tripadvisor.position || '--'}
                </Text>
                <Text style={styles.statSubWhite}>of 553</Text>
              </LinearGradient>
            </AnimatedPressable>
          )}

          <AnimatedPressable scaleTo={0.97} onPress={() => router.push('/service-charge')}>
            <LinearGradient
              colors={theme.gradients.sunset as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.statCard]}
            >
              <MaterialCommunityIcons name="currency-usd" size={32} color={theme.colors.white} style={styles.cardIcon} />
              <Text style={styles.statLabelWhite}>SERVICE CHARGE</Text>
              {isMetricsLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.statAmountWhite}>{metrics?.service_charge?.formatted || '$0.00'}</Text>
              )}
            </LinearGradient>
          </AnimatedPressable>

          <AnimatedPressable scaleTo={0.97} onPress={() => router.push('/ledger')}>
            <LinearGradient
              colors={[theme.colors.blue, '#2D9CDB'] as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.statCard]}
            >
              <MaterialCommunityIcons name="credit-card-outline" size={32} color={theme.colors.white} style={styles.cardIcon} />
              <Text style={styles.statLabelWhite}>CITY LEDGER</Text>
              {isLedgerLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.statAmountWhite}>${ledger?.current_balance?.toFixed(2) || '0.00'}</Text>
              )}
            </LinearGradient>
          </AnimatedPressable>

          <AnimatedPressable style={styles.statCardWhite} scaleTo={0.97} onPress={() => router.push('/exit-passes/new')}>
            <View style={styles.statIconCircle}>
              <Ionicons name="airplane" size={24} color={theme.colors.teal} />
            </View>
            <Text style={styles.statLabelDark}>CREATE PASS</Text>
          </AnimatedPressable>

          {(user?.role_name === 'HOD' || user?.role_name === 'Admin' || user?.role_name === 'Super Admin') && (
            <AnimatedPressable style={styles.statCardWhite} scaleTo={0.97} onPress={() => router.push('/approvals')}>
              <View style={[styles.statIconCircle, { backgroundColor: theme.colors.transparent.blue10 }]}>
                <MaterialCommunityIcons name="clipboard-check" size={24} color={theme.colors.blue} />
              </View>
              <Text style={styles.statLabelDark}>APPROVALS</Text>
              <Text style={styles.statAmountDark}>{metrics?.approvals?.pending || 0}</Text>
            </AnimatedPressable>
          )}
        </ScrollView>
      </View>


    </View>
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.teal} />
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="newspaper-outline" size={48} color={theme.colors.textTertiary} />
      <Text style={styles.emptyText}>You're all caught up!</Text>
      <Text style={styles.emptySubtext}>New posts will appear here.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Ensure Status bar content is light when over the dark gradient */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.FlatList
        data={feedItems}
        keyExtractor={(item) => item.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            onDoubleTap={() => handleReact(item.id)}
            onPress={() => handleItemPress(item)}
            onJoinTrip={handleJoinTrip}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.teal]}
            tintColor={theme.colors.teal}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
      />

      {/* Create Post FAB — visible only for users with posting permission or admins */}
      {(user?.can_post_feed || user?.role_name === 'Admin' || user?.role_name === 'Super Admin') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/create-post')}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={26} color={theme.colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPage,
  },
  // Skeleton loading
  heroHeaderLoading: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  skeletonContainer: {
    padding: 0,
  },
  skeletonBlock: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.radius.md,
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.bgPage,
  },
  errorText: {
    fontFamily: theme.fonts.headingL,
    fontSize: 20,
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDetail: {
    fontFamily: theme.fonts.bodyM,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: theme.colors.teal,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.sm,
  },
  retryText: {
    fontFamily: theme.fonts.button,
    color: theme.colors.white,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 100, // Content bottom pad above nav bar
  },
  // ─── Hero Header ─────────────────────────
  header: {
    backgroundColor: theme.colors.bgPage,
    marginBottom: 16,
    zIndex: 1, // Ensure header is above the list background
  },
  heroHeaderBackground: {
    ...StyleSheet.absoluteFillObject,
    top: -1000,
    height: 1240,
    width: '500%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 26, 31, 0.45)',
    zIndex: 1,
    top: -1000,
    height: 1240,
  },
  heroContentWrapper: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 28,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroGreeting: {
    fontFamily: theme.fonts.headingXl,
    fontSize: 28,
    lineHeight: 32,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  heroDepartment: {
    fontFamily: theme.fonts.bodyM,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700', // Increased to bold
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  avatarWrap: {
    marginLeft: 12,
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: theme.colors.bgDarkMid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.button,
    fontSize: 18,
  },
  // ─── Stat Cards ──────────────────────────
  statCardsWrapper: {
    marginTop: -16, // pull up into the gradient slightly
    height: 196, // 180 card + padding
  },
  statCardsContent: {
    paddingHorizontal: 20,
    gap: 12,
    alignItems: 'center',
  },
  statCard: {
    width: 160,
    height: 180,
    borderRadius: theme.radius.lg,
    padding: 20,
    justifyContent: 'space-between',
    ...theme.shadows.level2,
  },
  statCardWhite: {
    backgroundColor: theme.colors.white,
    width: 160,
    height: 180,
    borderRadius: theme.radius.lg,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.level2,
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.transparent.teal10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    marginBottom: 8,
  },
  statLabelWhite: {
    fontFamily: theme.fonts.label,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.2,
  },
  statLabelDark: {
    fontFamily: theme.fonts.headingM,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  statAmountWhite: {
    fontFamily: theme.fonts.amount,
    fontSize: 26,
    lineHeight: 30,
    color: theme.colors.white,
    marginTop: 8,
  },
  statAmountDark: {
    fontFamily: theme.fonts.amount,
    fontSize: 26,
    lineHeight: 30,
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  statSubWhite: {
    fontFamily: theme.fonts.bodyM,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  // ─── Feed Section ────────────────────────
  feedSection: {
    marginTop: 12,
  },
  sectionHeaderTitle: {
    fontFamily: theme.fonts.headingL,
    fontSize: 20,
    color: theme.colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderSubtitle: {
    fontFamily: theme.fonts.bodyM,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: 'normal',
  },
  filterBar: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.white,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: theme.colors.teal,
    borderColor: theme.colors.teal,
    ...theme.shadows.tealGlow,
  },
  filterText: {
    fontFamily: theme.fonts.button,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: theme.colors.white,
  },
  // ─── Footer & Empty ──────────────────────
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: theme.fonts.headingM,
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: theme.fonts.bodyM,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.level3,
  },
  bellIconWrap: {
    marginRight: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0b162c',
  },
  badgeText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.label,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
