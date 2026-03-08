import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLeaves, LeaveRequest } from '../../src/hooks/useLeaves';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import PillHeader, { STATUSBAR_HEIGHT } from '../../src/components/PillHeader';

export default function LeavesScreen() {
    const { data: leaves, isLoading, isError } = useLeaves();
    const router = useRouter();

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
                <Text style={styles.errorText}>Failed to load leave requests.</Text>
            </View>
        );
    }

    const renderLeave = ({ item }: { item: LeaveRequest }) => {
        let statusColor = '#6B7280';
        let statusBg = '#F3F4F6';
        let iconName: any = 'clock-outline';

        const displayStatus = item.hod_status || item.hr_status || 'Pending';

        switch (displayStatus) {
            case 'Approved':
                statusColor = '#10B981';
                statusBg = '#D1FAE5';
                iconName = 'check-circle-outline';
                break;
            case 'Rejected':
                statusColor = '#EF4444';
                statusBg = '#FEE2E2';
                iconName = 'close-circle-outline';
                break;
            case 'Pending':
            default:
                statusColor = '#F59E0B';
                statusBg = '#FEF3C7';
                iconName = 'progress-clock';
                break;
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.leaveType}>{item.leave_type}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                        <MaterialCommunityIcons name={iconName} size={14} color={statusColor} style={{ marginRight: 4 }} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{displayStatus}</Text>
                    </View>
                </View>

                <View style={[styles.dateRow, { marginBottom: item.leave_reason ? 12 : 0 }]}>
                    <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>From</Text>
                        <Text style={styles.dateValue}>{item.from_date}</Text>
                    </View>
                    <MaterialCommunityIcons name="arrow-right-thin" size={24} color="#9CA3AF" style={styles.arrowIcon} />
                    <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>To</Text>
                        <Text style={styles.dateValue}>{item.to_date}</Text>
                    </View>
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{item.day} Days</Text>
                    </View>
                </View>

                {item.leave_reason ? (
                    <Text style={styles.reasonText} numberOfLines={2}>
                        "{item.leave_reason}"
                    </Text>
                ) : null}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="Leave Requests" />

            <FlatList
                data={leaves}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderLeave}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="calendar-blank-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No leave requests found.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/leaves/new')}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
            </TouchableOpacity>
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
        paddingBottom: 100, // Space for FAB
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    leaveType: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
    },
    dateItem: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    dateValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    arrowIcon: {
        marginHorizontal: 12,
    },
    durationBadge: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginLeft: 8,
    },
    durationText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
    },
    reasonText: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
        marginTop: 12,
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
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.teal,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.teal,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    }
});
