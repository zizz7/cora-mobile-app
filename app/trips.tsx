/**
 * Trips Screen — Rich trip cards with color strips, filter bar, capacity avatars.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTrips, Trip } from '../src/hooks/useTrips';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../src/theme/theme';
import PillHeader, { STATUSBAR_HEIGHT } from '../src/components/PillHeader';

const FILTERS = ['All', 'Open', 'Full'];

const formatDate = (dateStr: string) => {
    // Convert "25-02-2026" to "Feb 25, 2026"
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
};

export default function TripsScreen() {
    const { data: trips, isLoading, isError } = useTrips();
    const router = useRouter();
    const [filter, setFilter] = useState('All');

    const filteredTrips = (trips || []).filter(trip => {
        if (filter === 'All') return true;
        const isFull = trip.current_participants >= trip.max_participants;
        if (filter === 'Open') return !isFull;
        if (filter === 'Full') return isFull;
        return true;
    });

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.teal} />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="cloud-offline-outline" size={64} color={theme.colors.textTertiary} />
                <Text style={styles.errorText}>Failed to load trips.</Text>
            </View>
        );
    }

    const renderTrip = ({ item }: { item: Trip }) => {
        const remainingSpots = item.max_participants - item.current_participants;
        const isFull = remainingSpots <= 0;
        const isAlmostFull = !isFull && remainingSpots <= 3;

        let stripColor = theme.colors.teal;
        let badgeColor = theme.colors.transparent.teal10;
        let badgeTextColor = theme.colors.teal;
        let statusText = 'Open';

        if (isFull) {
            stripColor = theme.colors.pink;
            badgeColor = theme.colors.transparent.pink10;
            badgeTextColor = theme.colors.pink;
            statusText = 'Full';
        } else if (isAlmostFull) {
            stripColor = theme.colors.orange;
            badgeColor = 'rgba(249, 160, 63, 0.1)'; // Fallback since warning10 isn't in theme
            badgeTextColor = theme.colors.orange;
            statusText = 'Almost Full';
        }

        // Capacity dots
        const maxDots = 5;
        const filledDots = Math.min(maxDots, item.current_participants);
        const overflow = item.current_participants > maxDots ? item.current_participants - maxDots : 0;

        return (
            <TouchableOpacity
                style={[styles.card, isFull && styles.cardFull]}
                activeOpacity={isFull ? 1 : 0.8}
                onPress={() => !isFull && router.push(`/trips/${item.trip_id}` as any)}
            >
                {/* Left color strip */}
                <View style={[styles.colorStrip, { backgroundColor: stripColor }]} />

                <View style={styles.cardContent}>
                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <Text style={[styles.tripName, isFull && { opacity: 0.5 }]}>{item.trip_name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                            <Text style={[styles.statusText, { color: badgeTextColor }]}>{statusText}</Text>
                        </View>
                    </View>

                    {/* Inline Timeline */}
                    <View style={styles.timelineRow}>
                        <View style={styles.timelinePoint}>
                            <View style={[styles.timelineDotSmall, { backgroundColor: theme.colors.teal }]} />
                            <Text style={styles.timelineLabel}>{formatDate(item.departure_date)}</Text>
                            <Text style={styles.timelineTime}>{item.departure_time}</Text>
                        </View>
                        <View style={styles.timelineConnector}>
                            <View style={styles.timelineDash} />
                            <Ionicons name="airplane" size={14} color={theme.colors.textTertiary} style={{ marginHorizontal: 4 }} />
                            <View style={styles.timelineDash} />
                        </View>
                        <View style={[styles.timelinePoint, { alignItems: 'flex-end' }]}>
                            <View style={[styles.timelineDotSmall, { backgroundColor: theme.colors.textSecondary }]} />
                            <Text style={styles.timelineLabel}>Return</Text>
                            <Text style={styles.timelineTime}>{item.departure_time}</Text>
                        </View>
                    </View>

                    {/* Footer: Location + Capacity */}
                    <View style={styles.footerRow}>
                        <View style={styles.locationChip}>
                            <Ionicons name="location" size={14} color={theme.colors.teal} />
                            <Text style={styles.locationText}>{item.departure_location}</Text>
                        </View>

                        <View style={styles.capacityRow}>
                            {/* Avatar circles */}
                            <View style={styles.avatarStack}>
                                {Array.from({ length: Math.min(filledDots, item.current_participants) }).map((_, i) => (
                                    <View key={i} style={[styles.capacityDot, { marginLeft: i > 0 ? -6 : 0, backgroundColor: theme.colors.blue, zIndex: maxDots - i }]} />
                                ))}
                                {overflow > 0 && (
                                    <View style={[styles.capacityOverflow, { marginLeft: -6 }]}>
                                        <Text style={styles.capacityOverflowText}>+{overflow}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.capacityText}>{item.current_participants}/{item.max_participants}</Text>
                        </View>
                    </View>

                    {/* Full trip: Notify button */}
                    {isFull && (
                        <TouchableOpacity style={styles.notifyButton}>
                            <Ionicons name="notifications-outline" size={14} color={theme.colors.teal} />
                            <Text style={styles.notifyText}>Notify me if spot opens</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="Upcoming Trips" />

            {/* Filter Bar */}
            <View style={[styles.filterBar, { marginTop: STATUSBAR_HEIGHT + 40 }]}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterPill, filter === f && styles.filterPillActive]}
                        onPress={() => setFilter(f)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredTrips}
                keyExtractor={(item) => item.trip_id.toString()}
                renderItem={renderTrip}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="airplane-outline" size={64} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>No trips found</Text>
                        <Text style={styles.emptySubtext}>
                            {filter === 'All' ? 'No upcoming trips available.' : `No ${filter.toLowerCase()} trips available. Try a different filter.`}
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/create-trip')} activeOpacity={0.8}>
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
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        marginTop: 16,
    },
    listContent: {
        padding: 24,
        paddingBottom: 40,
    },
    // ─── Filter Bar ────────────────────────
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.level1,
    },
    filterPillActive: {
        backgroundColor: theme.colors.teal,
        borderColor: theme.colors.teal,
    },
    filterText: {
        fontSize: 14,
        fontFamily: theme.fonts.button,
        color: theme.colors.textPrimary,
    },
    filterTextActive: {
        color: theme.colors.white,
    },
    // ─── Trip Card ─────────────────────────
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.level1,
    },
    cardFull: {
        opacity: 0.65,
    },
    colorStrip: {
        width: 6,
    },
    cardContent: {
        flex: 1,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    tripName: {
        fontFamily: theme.fonts.headingXl,
        fontSize: 22,
        color: theme.colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
    },
    statusText: {
        fontFamily: theme.fonts.label,
        fontSize: 11,
        textTransform: 'uppercase',
    },
    // ─── Timeline ──────────────────────────
    timelineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.bgPage,
        borderRadius: theme.radius.md,
    },
    timelinePoint: {
        alignItems: 'flex-start',
        flex: 1,
    },
    timelineDotSmall: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    timelineLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 12,
        color: theme.colors.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    timelineTime: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    timelineConnector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    timelineDash: {
        width: 16,
        height: 1.5,
        backgroundColor: theme.colors.borderLight,
    },
    // ─── Footer ────────────────────────────
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.transparent.teal10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
    },
    locationText: {
        fontFamily: theme.fonts.headingS,
        fontSize: 13,
        color: theme.colors.teal,
        marginLeft: 4,
    },
    capacityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarStack: {
        flexDirection: 'row',
        marginRight: 8,
    },
    capacityDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.white,
    },
    capacityOverflow: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.bgPage,
        borderWidth: 2,
        borderColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    capacityOverflowText: {
        fontFamily: theme.fonts.label,
        fontSize: 9,
        color: theme.colors.textSecondary,
    },
    capacityText: {
        fontFamily: theme.fonts.headingS,
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    // ─── Notify Button ─────────────────────
    notifyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.transparent.teal10,
        borderRadius: theme.radius.md,
    },
    notifyText: {
        fontFamily: theme.fonts.button,
        fontSize: 14,
        color: theme.colors.teal,
        marginLeft: 8,
    },
    // ─── Empty ─────────────────────────────
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
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
        lineHeight: 22,
    },
    // ─── FAB ────────────────────────────────
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
