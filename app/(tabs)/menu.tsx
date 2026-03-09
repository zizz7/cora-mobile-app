/**
 * More / Menu Screen — Bento grid layout with gradient featured cards.
 */
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import AnimatedPressable from '../../src/components/AnimatedPressable';
import { theme } from '../../src/theme/theme';

const MENU_ITEMS = [
    { id: 'trips', icon: 'airplane', label: 'Trips', color: theme.colors.teal, route: '/trips', featured: true },
    { id: 'serviceCharge', icon: 'currency-usd', label: 'Service Charge', color: theme.colors.orange, route: '/service-charge', featured: true },
    { id: 'events', icon: 'calendar-star', label: 'Events', color: theme.colors.orange, route: '/events', featured: false },
    { id: 'leaves', icon: 'calendar-remove', label: 'Leave Requests', color: theme.colors.danger, route: '/leaves', featured: false },
    { id: 'gatepass', icon: 'ticket-confirmation-outline', label: 'Gate Pass', color: theme.colors.blue, route: '/gatepass', featured: false },
    { id: 'gatepassApprovals', icon: 'ticket-confirmation', label: 'Pass Approvals', color: theme.colors.pink, route: '/approvals/gatepass', featured: false },
    { id: 'exitPass', icon: 'airplane-takeoff', label: 'Exit Passes', color: theme.colors.teal, route: '/exit-passes', featured: false },
    { id: 'tasks', icon: 'check-circle-outline', label: 'Tasks', color: theme.colors.teal, route: '/tasks', featured: false },
    { id: 'mentions', icon: 'star', label: 'Mentions', color: theme.colors.orange, route: '/mentions', featured: false },
    { id: 'transport', icon: 'bus', label: 'Transport', color: theme.colors.blue, route: '/transport', featured: false },
    { id: 'admin', icon: 'shield-check', label: 'Admin Settings', color: theme.colors.teal, route: '/admin', featured: false },
];

export default function MenuScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const filteredMenuItems = MENU_ITEMS.filter(item => {
        if (item.id === 'tasks') return user?.can_manage_tasks;
        if (item.id === 'transport') return user?.transport_management;
        if (item.id === 'mentions') return user?.can_log_ta_mentions;
        if (item.id === 'admin') return user?.role_name === 'Admin' || user?.role_name === 'Super Admin';
        if (item.id === 'gatepass') {
            const uId = (user?.user_id || '').toUpperCase();
            const isApprover = Boolean(user?.gatepass_approval) ||
                ['Security', 'Admin'].includes(user?.role_name || '') ||
                ['CCM0450', 'CCM0444', 'CCM0061', 'CCM0497'].includes(uId);
            return Boolean(user?.gatepass_approval) || isApprover;
        }
        if (item.id === 'gatepassApprovals') {
            const uId = (user?.user_id || '').toUpperCase();
            return Boolean(user?.gatepass_approval) ||
                ['Security', 'Admin'].includes(user?.role_name || '') ||
                ['CCM0450', 'CCM0444', 'CCM0061', 'CCM0497'].includes(uId);
        }
        return true;
    });

    const firstName = user?.name?.split(' ')[0] || 'User';
    const featured = filteredMenuItems.filter(i => i.featured);
    const secondary = filteredMenuItems.filter(i => !i.featured);

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            {/* White pill tab header */}
            <View style={styles.pillHeader}>
                <Text style={styles.pillHeaderText}>More</Text>
            </View>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >

                {/* Profile Card — Full Width */}
                <AnimatedPressable
                    scaleTo={0.97}
                    onPress={() => router.push('/(tabs)/profile')}
                >
                    <View style={styles.profileCard}>
                        <View style={styles.profileRow}>
                            {user?.avatar_url ? (
                                <Image source={{ uri: user.avatar_url }} style={styles.profileAvatar} />
                            ) : (
                                <View style={styles.profileAvatarFallback}>
                                    <Text style={styles.profileAvatarText}>{firstName.charAt(0).toUpperCase()}</Text>
                                </View>
                            )}
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                                <Text style={styles.profileRole}>{user?.department || user?.role_name || 'Staff'}</Text>
                            </View>
                            <View style={styles.profileChevron}>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                            </View>
                        </View>
                    </View>
                </AnimatedPressable>

                {/* Featured Cards — Gradient Bento Blocks */}
                <View style={styles.featuredRow}>
                    {featured.map((item, index) => {
                        const gradient = item.id === 'trips' ? theme.gradients.ocean : theme.gradients.sunset;
                        return (
                            <AnimatedPressable
                                key={item.id}
                                scaleTo={0.96}
                                onPress={() => router.push(item.route as any)}
                                style={{ flex: 1, paddingRight: index === 0 ? 6 : 0, paddingLeft: index === 1 ? 6 : 0 }}
                            >
                                <LinearGradient
                                    colors={gradient as readonly [string, string, ...string[]]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.featuredCard}
                                >
                                    <MaterialCommunityIcons
                                        name={item.icon as any}
                                        size={100}
                                        color="rgba(255,255,255,0.08)"
                                        style={styles.featuredBgIcon}
                                    />
                                    <View style={styles.featuredIconContainer}>
                                        <MaterialCommunityIcons
                                            name={item.icon as any}
                                            size={32}
                                            color={theme.colors.white}
                                        />
                                    </View>
                                    <Text style={styles.featuredLabel}>{item.label}</Text>
                                </LinearGradient>
                            </AnimatedPressable>
                        );
                    })}
                </View>

                {/* Secondary Cards — White, Bento Grid */}
                <Text style={styles.sectionTitle}>Tools & Services</Text>
                <View style={styles.secondaryGrid}>
                    {secondary.map((item) => (
                        <AnimatedPressable
                            key={item.id}
                            style={styles.secondaryCard}
                            onPress={() => router.push(item.route as any)}
                            scaleTo={0.95}
                        >
                            <View style={[styles.secondaryIconBg, { backgroundColor: `${item.color}15` }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                            </View>
                            <Text style={styles.secondaryLabel}>{item.label}</Text>
                        </AnimatedPressable>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24);

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.bgPage,
    },
    pillHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center',
        paddingTop: STATUSBAR_HEIGHT - 6,
        paddingBottom: 10,
    },
    pillHeaderText: {
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: theme.colors.textPrimary,
        backgroundColor: theme.colors.white,
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
        ...theme.shadows.level1,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingTop: STATUSBAR_HEIGHT + 40, // space below the pill
        paddingBottom: 100,
    },
    pageTitle: {
        fontFamily: theme.fonts.display,
        fontSize: 32,
        color: theme.colors.textPrimary,
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    // ─── Profile Card ──────────────────────
    profileCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.xl,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.level1,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileAvatar: {
        width: 56,
        height: 56,
        borderRadius: Number.parseInt(theme.radius.pill as unknown as string, 10) || 28, // Defensive fallback
    },
    profileAvatarFallback: {
        width: 56,
        height: 56,
        borderRadius: 28, // Using literal value since radius.pill might be a string depending on implementation
        backgroundColor: theme.colors.transparent.teal10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileAvatarText: {
        fontFamily: theme.fonts.headingL,
        color: theme.colors.teal,
        fontSize: 24,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontFamily: theme.fonts.headingM,
        fontSize: 18,
        color: theme.colors.textPrimary,
    },
    profileRole: {
        fontFamily: theme.fonts.label,
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    profileChevron: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.bgPage,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // ─── Featured Cards ────────────────────
    featuredRow: {
        flexDirection: 'row',
        marginBottom: 32,
    },
    featuredCard: {
        borderRadius: theme.radius.xl,
        padding: 20,
        height: 140,
        justifyContent: 'space-between',
        overflow: 'hidden',
        ...theme.shadows.tealGlow,
    },
    featuredBgIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        transform: [{ rotate: '-15deg' }],
    },
    featuredIconContainer: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.md,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featuredLabel: {
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        color: theme.colors.white,
    },
    sectionTitle: {
        fontFamily: theme.fonts.headingM,
        fontSize: 18,
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    // ─── Secondary Grid ────────────────────
    secondaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 16,
    },
    secondaryCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: 16,
        width: '48%', // 2 columns for better readability and touch targets
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.level1,
    },
    secondaryIconBg: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    secondaryLabel: {
        fontFamily: theme.fonts.headingS,
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
});
