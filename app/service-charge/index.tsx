/**
 * Service Charge Screen — Premium financial view.
 * Full-bleed hero bleeding under status bar, transparent nav, fluid minimal layout.
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useServiceCharge, ServiceCharge } from '../../src/hooks/useServiceCharge';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';

export default function ServiceChargeScreen() {
    const { data: records, isLoading, isError } = useServiceCharge();
    const router = useRouter();
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: theme.animation.spring as any
        }).start();
    }, []);

    // Title opacity — fades in when scrolled past hero
    const headerTitleOpacity = scrollY.interpolate({
        inputRange: [180, 240],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const headerBgOpacity = scrollY.interpolate({
        inputRange: [150, 220],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <Stack.Screen options={{
                    headerShown: true,
                    headerTitle: 'Service Charge',
                    headerBackTitle: 'Back',
                    headerStyle: { backgroundColor: theme.colors.bgPage },
                    headerTintColor: theme.colors.textPrimary,
                    headerShadowVisible: false,
                    headerTitleStyle: { fontFamily: theme.fonts.headingM }
                }} />
                <ActivityIndicator size="large" color={theme.colors.teal} />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Stack.Screen options={{
                    headerShown: true,
                    headerTitle: 'Service Charge',
                    headerBackTitle: 'Back',
                    headerStyle: { backgroundColor: theme.colors.bgPage },
                    headerTintColor: theme.colors.textPrimary,
                    headerShadowVisible: false,
                    headerTitleStyle: { fontFamily: theme.fonts.headingM }
                }} />
                <Ionicons name="cloud-offline-outline" size={64} color={theme.colors.textTertiary} />
                <Text style={styles.errorText}>Failed to load service charge records.</Text>
            </View>
        );
    }

    const latestRecord = records?.length ? records[0] : null;

    // Build sparkline from last 6 records
    const sparklineRecords = (records || []).slice(0, 6).reverse();
    const sparklinePoints = (() => {
        if (sparklineRecords.length < 2) return '';
        const amounts = sparklineRecords.map(r => Number(r.amount));
        const max = Math.max(...amounts);
        const min = Math.min(...amounts);
        const range = max - min || 1;
        const w = 280;
        const h = 55;
        const pad = 8;
        return amounts.map((val, i) => {
            const x = pad + (i / (amounts.length - 1)) * (w - 2 * pad);
            const y = pad + ((max - val) / range) * (h - 2 * pad);
            return `${x},${y}`;
        }).join(' ');
    })();

    const renderRecord = useCallback(({ item, index }: { item: ServiceCharge; index: number }) => {
        const [yearPart, monthPart] = item.month.split('-');
        const dateObj = new Date(Number.parseInt(yearPart), Number.parseInt(monthPart) - 1);
        const monthStr = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
        const yearStr = dateObj.getFullYear();
        const amount = Number(item.amount);

        // Month-over-month change
        let changePercent: number | null = null;
        if (records && index < records.length - 1) {
            const prevAmount = Number(records[index + 1].amount);
            if (prevAmount > 0) {
                changePercent = ((amount - prevAmount) / prevAmount) * 100;
            }
        }

        const isFirst = index === 0;

        return (
            <View style={styles.recordRow}>
                {/* Timeline accent */}
                <View style={styles.timelineAccent}>
                    <View style={[
                        styles.timelineDot,
                        isFirst && { backgroundColor: theme.colors.teal, borderColor: theme.colors.transparent.teal20 }
                    ]} />
                    {index < (records?.length || 1) - 1 && <View style={styles.timelineLine} />}
                </View>

                {/* Card */}
                <View style={[styles.recordCard, isFirst && styles.recordCardFirst]}>
                    <View style={styles.recordLeft}>
                        <Text style={[styles.recordMonth, isFirst && { color: theme.colors.textPrimary }]}>{monthStr}</Text>
                        <Text style={styles.recordYear}>{yearStr}</Text>
                    </View>
                    <View style={styles.recordRight}>
                        <Text style={[styles.recordAmount, isFirst && { color: theme.colors.teal }]}>
                            <Text style={styles.recordCurrency}>{item.currency || 'USD'}</Text>
                            {' '}{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                        {changePercent !== null && (
                            <View style={[
                                styles.trendPill,
                                { backgroundColor: changePercent >= 0 ? theme.colors.transparent.teal10 : theme.colors.transparent.pink10 }
                            ]}>
                                <Text style={[
                                    styles.trendText,
                                    { color: changePercent >= 0 ? theme.colors.teal : theme.colors.pink }
                                ]}>
                                    {changePercent >= 0 ? '↑' : '↓'} {Math.abs(changePercent).toFixed(1)}%
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    }, [records]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* Custom transparent header overlay */}
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.navOverlay} pointerEvents="box-none">
                <Animated.View style={[styles.navBg, { opacity: headerBgOpacity }]} />
                <View style={styles.navContent}>
                    <Ionicons
                        name="chevron-back"
                        size={28}
                        color="#fff" // Keeps back button white over dark gradient
                        onPress={() => router.back()}
                        style={styles.backButton}
                    />
                    <Animated.Text style={[styles.navTitle, { opacity: headerTitleOpacity }]}>
                        Service Charge
                    </Animated.Text>
                    <View style={{ width: 28 }} />
                </View>
            </View>

            <Animated.FlatList
                data={records}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRecord}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                ListHeaderComponent={
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                        {/* Full-bleed Hero */}
                        <LinearGradient
                            colors={theme.gradients.sunset as readonly [string, string, ...string[]]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.hero}
                        >
                            {/* Radial glow */}
                            <View style={styles.glowCircle} />

                            {/* BG icon watermark */}
                            <MaterialCommunityIcons
                                name="wallet-giftcard"
                                size={140}
                                color="rgba(255,255,255,0.06)"
                                style={styles.bgIcon}
                            />

                            <Text style={styles.heroLabel}>LATEST SERVICE CHARGE</Text>
                            <Text style={styles.heroAmount}>
                                <Text style={styles.heroCurrency}>{latestRecord?.currency || 'USD'}</Text>
                                {' '}{latestRecord
                                    ? Number(latestRecord.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : '0.00'}
                            </Text>
                            <Text style={styles.heroMonth}>
                                {latestRecord ? (() => {
                                    const [y, m] = latestRecord.month.split('-');
                                    return new Date(Number.parseInt(y), Number.parseInt(m) - 1)
                                        .toLocaleString('default', { month: 'long', year: 'numeric' });
                                })() : '—'}
                            </Text>

                            {/* Sparkline */}
                            {sparklinePoints.length > 0 && (
                                <View style={styles.sparklineWrap}>
                                    <Svg width={280} height={55}>
                                        <Defs>
                                            <SvgGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
                                                <Stop offset="0" stopColor={theme.colors.white} stopOpacity="0.2" />
                                                <Stop offset="1" stopColor={theme.colors.white} stopOpacity="0.9" />
                                            </SvgGradient>
                                        </Defs>
                                        <Polyline
                                            points={sparklinePoints}
                                            fill="none"
                                            stroke="url(#sparkGrad)"
                                            strokeWidth={3}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </Svg>
                                    <Text style={styles.sparklineLabel}>LAST {sparklineRecords.length} MONTHS TREND</Text>
                                </View>
                            )}
                        </LinearGradient>

                        {/* Section header */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>History</Text>
                            <Text style={styles.sectionCount}>{records?.length || 0} Records</Text>
                        </View>
                    </Animated.View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={56} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>No records found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgPage,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.bgPage,
    },
    errorText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        marginTop: 16,
    },
    listContent: {
        paddingBottom: 40,
    },
    // ─── Custom Nav Overlay ─────────────────
    navOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: Platform.OS === 'ios' ? 52 : 36,
    },
    navBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.orange, // match the sunset hero gradient
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.borderLight,
    },
    navContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 44,
    },
    backButton: {
        padding: 4,
    },
    navTitle: {
        fontFamily: theme.fonts.headingM,
        fontSize: 18,
        color: theme.colors.white,
    },
    // ─── Hero ───────────────────────────────
    hero: {
        paddingTop: Platform.OS === 'ios' ? 120 : 100,
        paddingBottom: 44,
        paddingHorizontal: 24,
        alignItems: 'center',
        overflow: 'hidden',
    },
    glowCircle: {
        position: 'absolute',
        bottom: -80,
        left: -40,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    bgIcon: {
        position: 'absolute',
        top: 40,
        right: -30,
        transform: [{ rotate: '15deg' }],
    },
    heroLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 2,
        marginBottom: 8,
    },
    heroAmount: {
        fontFamily: theme.fonts.display,
        fontSize: 56,
        lineHeight: 60,
        color: theme.colors.white,
        letterSpacing: -1,
        marginBottom: 8,
    },
    heroCurrency: {
        fontFamily: theme.fonts.headingM,
        fontSize: 24,
        color: 'rgba(255,255,255,0.7)',
    },
    heroMonth: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 32,
    },
    sparklineWrap: {
        alignItems: 'center',
    },
    sparklineLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 12,
        letterSpacing: 1.5,
    },
    // ─── Section Header ─────────────────────
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontFamily: theme.fonts.headingL,
        fontSize: 20,
        color: theme.colors.textPrimary,
    },
    sectionCount: {
        fontFamily: theme.fonts.button,
        fontSize: 13,
        color: theme.colors.textTertiary,
    },
    // ─── Timeline Records ───────────────────
    recordRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    timelineAccent: {
        width: 20,
        alignItems: 'center',
        paddingTop: 16, // lowered to alight with the card content
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.borderLight,
        borderWidth: 2,
        borderColor: theme.colors.bgPage,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: theme.colors.borderLight,
        marginTop: 4,
    },
    recordCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.md,
        paddingVertical: 18,
        paddingHorizontal: 16,
        marginLeft: 12,
        marginBottom: 12,
        ...theme.shadows.level1,
    },
    recordCardFirst: {
        borderWidth: 1.5,
        borderColor: theme.colors.transparent.blue10,
        ...theme.shadows.level2,
    },
    recordLeft: {
        flex: 1,
    },
    recordMonth: {
        fontFamily: theme.fonts.button,
        fontSize: 14,
        color: theme.colors.textSecondary,
        letterSpacing: 1,
    },
    recordYear: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 12,
        color: theme.colors.textTertiary,
        marginTop: 2,
    },
    recordRight: {
        alignItems: 'flex-end',
    },
    recordAmount: {
        fontFamily: theme.fonts.headingL,
        fontSize: 20,
        color: theme.colors.textSecondary,
    },
    recordCurrency: {
        fontFamily: theme.fonts.button,
        fontSize: 13,
        color: theme.colors.textTertiary,
    },
    trendPill: {
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.pill,
    },
    trendText: {
        fontFamily: theme.fonts.button,
        fontSize: 11,
    },
    // ─── Empty ──────────────────────────────
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
});
