import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTransportLog, TransportTrip } from '../src/hooks/useTransportTrips';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../src/theme/theme';
import PillHeader, { STATUSBAR_HEIGHT } from '../src/components/PillHeader';

export default function TransportScreen() {
    const { data: logData, isLoading, isError } = useTransportLog();
    const router = useRouter();

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.teal} />
            </View>
        );
    }

    if (isError || !logData) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="cloud-offline-outline" size={64} color={theme.colors.textTertiary} />
                <Text style={styles.errorText}>Failed to load transport log.</Text>
            </View>
        );
    }

    const { trips, totals, currentFuel } = logData;

    const renderStat = (icon: string, label: string, value: string | number, color: string) => (
        <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={20} color={color} />
            </View>
            <View>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
            </View>
        </View>
    );

    const TANK_CAPACITY = 200; // litres
    const fuelPercent = Math.min(100, Math.max(0, (currentFuel / TANK_CAPACITY) * 100));
    const fuelColor = fuelPercent > 50 ? theme.colors.teal : fuelPercent > 20 ? theme.colors.orange : theme.colors.danger;

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Fuel Balance Gauge */}
            <View style={styles.fuelCard}>
                <View style={styles.fuelCardHeader}>
                    <View style={styles.fuelTitleRow}>
                        <Ionicons name="water" size={20} color={fuelColor} />
                        <Text style={styles.fuelTitle}>Fuel Balance</Text>
                    </View>
                    <Text style={[styles.fuelPercentText, { color: fuelColor }]}>{fuelPercent.toFixed(0)}%</Text>
                </View>
                <View style={styles.fuelBarTrack}>
                    <View style={[styles.fuelBarFill, { width: `${fuelPercent}%`, backgroundColor: fuelColor }]} />
                </View>
                <View style={styles.fuelLabelRow}>
                    <Text style={styles.fuelLabelValue}>{currentFuel} L remaining</Text>
                    <Text style={styles.fuelLabelCapacity}>{TANK_CAPACITY} L capacity</Text>
                </View>
            </View>

            <View style={styles.statsGrid}>
                {renderStat('water-outline', 'Fuel Used', `${totals.fuel} L`, theme.colors.orange)}
                {renderStat('cash-outline', 'Fuel Cost', `$${totals.cost.toFixed(2)}`, theme.colors.teal)}
                {renderStat('people-outline', 'Guests', totals.guests, theme.colors.blue)}
                {renderStat('boat-outline', 'Total Trips', totals.trips, theme.colors.textPrimary)}
            </View>
            <Text style={styles.tripsTitle}>Recent Trips</Text>
        </View>
    );

    const renderTrip = useCallback(({ item }: { item: TransportTrip }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.routeText}>{item.route}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{item.departure} - {item.arrival}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="water-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{item.fuelLiters} L</Text>
                </View>
            </View>

            <View style={styles.paxRow}>
                <View style={styles.paxBadge}>
                    <Text style={styles.paxText}>{item.guests} Guests</Text>
                </View>
                <View style={[styles.paxBadge, { backgroundColor: theme.colors.borderLight }]}>
                    <Text style={[styles.paxText, { color: theme.colors.textSecondary }]}>{item.staff} Staff</Text>
                </View>
            </View>

            {item.remarks ? (
                <Text style={styles.remarksText}>{item.remarks}</Text>
            ) : null}
        </View>
    ), []);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="Transport Log" />

            <FlashList
                data={trips}
                renderItem={renderTrip}
                keyExtractor={item => item.id.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="boat-outline" size={64} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>No Trips Logged</Text>
                        <Text style={styles.emptySubtext}>There are no transport logs for this month.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/create-transport-trip')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color={theme.colors.white} />
            </TouchableOpacity>
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
        fontSize: 16,
        marginTop: 12,
    },
    listContent: {
        padding: 16,
        paddingTop: STATUSBAR_HEIGHT + 44,
        paddingBottom: 100, // space for FAB
    },
    headerContainer: {
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statBox: {
        width: '48%',
        backgroundColor: theme.colors.surfaceCard,
        borderRadius: theme.radius.md,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        ...theme.shadows.level1,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    statIconBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontFamily: theme.fonts.caption,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    statValue: {
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginTop: 2,
    },
    tripsTitle: {
        fontFamily: theme.fonts.headingM,
        fontSize: 18,
        color: theme.colors.bgDarkDeep,
    },
    // ─── Fuel Gauge ──────────────────────────
    fuelCard: {
        backgroundColor: theme.colors.surfaceCard,
        borderRadius: theme.radius.lg,
        padding: 20,
        marginBottom: 16,
        ...theme.shadows.level1,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    fuelCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    fuelTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fuelTitle: {
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    fuelPercentText: {
        fontFamily: theme.fonts.display,
        fontSize: 24,
        letterSpacing: -0.5,
    },
    fuelBarTrack: {
        height: 14,
        backgroundColor: theme.colors.borderLight,
        borderRadius: 7,
        overflow: 'hidden',
        marginBottom: 10,
    },
    fuelBarFill: {
        height: '100%',
        borderRadius: 7,
    },
    fuelLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    fuelLabelValue: {
        fontFamily: theme.fonts.headingS,
        fontSize: 13,
        color: theme.colors.textPrimary,
    },
    fuelLabelCapacity: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    card: {
        backgroundColor: theme.colors.surfaceCard,
        borderRadius: theme.radius.md,
        padding: 16,
        marginBottom: 16,
        ...theme.shadows.level1,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    routeText: {
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: theme.colors.textPrimary,
        flex: 1,
    },
    dateText: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    paxRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    paxBadge: {
        backgroundColor: theme.colors.transparent.blue10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.sm,
    },
    paxText: {
        fontFamily: theme.fonts.label,
        fontSize: 12,
        color: theme.colors.blue,
    },
    remarksText: {
        fontFamily: theme.fonts.bodyS,
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 32,
    },
    emptyText: {
        fontFamily: theme.fonts.headingL,
        fontSize: 20,
        color: theme.colors.textPrimary,
        marginTop: 16,
    },
    emptySubtext: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
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
});
