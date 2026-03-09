import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useCalendar, CalendarActivity } from '../../src/hooks/useCalendar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function CalendarScreen() {
    const { data: activities, isLoading, isError } = useCalendar();
    const [selectedView, setSelectedView] = useState<'All' | 'Shift' | 'Duty' | 'Event'>('All');


    const renderActivity = useCallback(({ item }: { item: CalendarActivity }) => {
        let typeColor = '#6B7280';
        let iconName: any = 'calendar';

        switch (item.type) {
            case 'Shift':
                typeColor = '#3B82F6';
                iconName = 'briefcase-clock';
                break;
            case 'Duty':
                typeColor = '#F59E0B';
                iconName = 'shield-account';
                break;
            case 'Event':
                typeColor = '#A855F7';
                iconName = 'star-circle';
                break;
        }

        return (
            <View style={styles.card}>
                <View style={styles.dateCol}>
                    <Text style={styles.dayText}>{item.date?.substring(8, 10) || '--'}</Text>
                    <Text style={styles.monthText}>
                        {item.date
                            ? new Date(item.date).toLocaleString('default', { month: 'short' }).toUpperCase()
                            : '---'}
                    </Text>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.title} numberOfLines={1}>{item.activity_name}</Text>
                        <MaterialCommunityIcons name={iconName} size={20} color={typeColor} style={{ marginLeft: 8 }} />
                    </View>

                    <View style={styles.footerRow}>
                        <View style={styles.timeContainer}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                            <Text style={styles.timeText}>{item.start_time} - {item.end_time}</Text>
                        </View>
                        {item.location && (
                            <View style={styles.locationContainer}>
                                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#6B7280" />
                                <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    }, []);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0A2540" />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load calendar.</Text>
            </View>
        );
    }

    const filteredActivities = activities?.filter(act => {
        if (selectedView === 'All') return true;
        return act.type === selectedView;
    }) || [];

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Roster & Activities', headerBackTitle: 'Home' }} />

            <View style={styles.filterScrollView}>
                {['All', 'Shift', 'Duty', 'Event'].map((view) => (
                    <TouchableOpacity
                        key={view}
                        style={[styles.filterPill, selectedView === view && styles.filterPillActive]}
                        onPress={() => setSelectedView(view as any)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.filterPillText, selectedView === view && styles.filterPillTextActive]}>
                            {view}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlashList
                data={filteredActivities}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderActivity}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="calendar-blank" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No activities scheduled.</Text>
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
    filterScrollView: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
    },
    filterPillActive: {
        backgroundColor: '#0A2540',
    },
    filterPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    filterPillTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    dateCol: {
        width: 72,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    dayText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
    },
    monthText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginTop: 2,
    },
    cardContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    description: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 18,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
        marginLeft: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
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
