import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useEvents, Event } from '../../src/hooks/useEvents';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import PillHeader, { STATUSBAR_HEIGHT } from '../../src/components/PillHeader';
import { theme } from '../../src/theme/theme';

export default function EventsScreen() {
    const { data: events, isLoading, isError } = useEvents();
    const router = useRouter();

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#A855F7" />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load events.</Text>
            </View>
        );
    }

    const renderEvent = useCallback(({ item }: { item: Event }) => {
        const remainingSpots = item.max_participants - item.current_participants;
        const isFull = remainingSpots <= 0;

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => router.push(`/events/${item.event_id}` as any)}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.typeContainer}>
                        <MaterialCommunityIcons name="star-circle" size={16} color="#A855F7" />
                        <Text style={styles.typeText}>{item.event_type}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isFull ? '#FEE2E2' : '#F3E8FF' }]}>
                        <Text style={[styles.statusText, { color: isFull ? '#EF4444' : '#9333EA' }]}>
                            {isFull ? 'Full' : 'Open'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.eventName}>{item.event_name}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.event_description}</Text>

                <View style={styles.divider} />

                <View style={styles.footerRow}>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="calendar-clock" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{item.event_date} · {item.event_time}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="map-marker-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{item.location}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }, [router]);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="Team Events" />

            <FlashList
                data={events}
                keyExtractor={(item) => item.event_id.toString()}
                renderItem={renderEvent}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="calendar-star" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No upcoming events available.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
    },
    listContent: {
        padding: 16,
        paddingTop: STATUSBAR_HEIGHT + 44,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#A855F7',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#A855F7',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    eventName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 16,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 12,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '48%',
    },
    detailText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    }
});
