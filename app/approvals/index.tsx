import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useExitPasses, useApproveExitPass } from '../../src/hooks/useExitPasses';
import { useAuth } from '../../src/context/AuthContext';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme/theme';
import PillHeader, { STATUSBAR_HEIGHT } from '../../src/components/PillHeader';
import AnimatedPressable from '../../src/components/AnimatedPressable';

export default function ApprovalsScreen() {
    const { user } = useAuth();
    const { data: exitPassesPage, isLoading, isError, refetch } = useExitPasses();
    const approveMutation = useApproveExitPass();

    // Since useExitPasses is an infinite query, we extract the first page data for simplicity
    const allPasses = exitPassesPage?.pages?.flatMap(page => page.data) || [];

    // Filter logic: HODs only see Pending passes from their department that are NOT their own
    const pendingApprovals = allPasses.filter(pass => {
        if (pass.user?.user_id === user?.user_id) return false;
        if (user?.role_name === 'HOD') {
            return pass.hod_status === 'Pending' && pass.user?.department === user?.department;
        }
        if (user?.role_name === 'HR' || user?.role_name === 'Admin' || user?.role_name === 'Super Admin') {
            return pass.hr_status === 'Pending' && pass.hod_status === 'Approved by: ' + pass.hod_status?.replace('Approved by: ', '') || pass.hod_status === 'Approved' || pass.hod_status?.startsWith('Approved');
        }
        return false;
    });

    const handleAction = (id: number, action: 'approve' | 'reject') => {
        const level = (user?.role_name === 'Admin' || user?.role_name === 'Super Admin' || user?.role_name === 'HR') ? 'hr' : 'hod';

        Alert.alert(
            `${action === 'approve' ? 'Approve' : 'Reject'} Exit Pass`,
            `Are you sure you want to ${action} this exit pass?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: action === 'approve' ? 'default' : 'destructive',
                    onPress: () => {
                        approveMutation.mutate({
                            id,
                            action,
                            level,
                            reason: action === 'reject' ? 'Rejected via Mobile App' : undefined
                        }, {
                            onSuccess: () => {
                                Alert.alert('Success', `Exit pass ${action}d successfully.`);
                                refetch();
                            },
                            onError: (error) => {
                                Alert.alert('Error', `Failed to ${action} exit pass.`);
                            }
                        });
                    }
                }
            ]
        );
    };

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
                <Text style={styles.errorText}>Failed to load pending approvals.</Text>
            </View>
        );
    }

    const renderApprovalItem = ({ item }: { item: any }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarText}>{item.user?.name?.charAt(0) || 'U'}</Text>
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{item.user?.name}</Text>
                            <Text style={styles.userDept}>{item.user?.department}</Text>
                        </View>
                    </View>
                    <View style={styles.badgePending}>
                        <Text style={styles.badgeText}>Action Required</Text>
                    </View>
                </View>

                <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.detailText}>{item.departure_date} - {item.return_date}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="airplane-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.detailText}>{item.leave_type}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.detailText}>{item.location}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="boat-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.detailText}>{item.mode_of_departure}</Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <AnimatedPressable
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleAction(item.id, 'reject')}
                        scaleTo={0.95}
                    >
                        <Ionicons name="close-circle-outline" size={20} color={theme.colors.danger} />
                        <Text style={styles.rejectText}>Decline</Text>
                    </AnimatedPressable>
                    <AnimatedPressable
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleAction(item.id, 'approve')}
                        scaleTo={0.95}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.white} />
                        <Text style={styles.approveText}>Approve</Text>
                    </AnimatedPressable>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="Approvals Inbox" />

            <FlatList
                data={pendingApprovals}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderApprovalItem}
                contentContainerStyle={[styles.listContent, { paddingTop: STATUSBAR_HEIGHT + 60 }]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="clipboard-check-outline" size={64} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>You're all caught up!</Text>
                        <Text style={styles.emptySubtext}>No pending exit passes require your signature.</Text>
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
        color: theme.colors.danger,
        fontSize: 16,
        fontFamily: theme.fonts.bodyM,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.xl,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.level1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarFallback: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.transparent.teal10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontFamily: theme.fonts.headingL,
        fontSize: 20,
        color: theme.colors.teal,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    userDept: {
        fontFamily: theme.fonts.label,
        fontSize: 12,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
    },
    badgePending: {
        backgroundColor: `${theme.colors.orange}15`,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.pill,
    },
    badgeText: {
        fontFamily: theme.fonts.button,
        fontSize: 11,
        color: theme.colors.orange,
    },
    detailsGrid: {
        gap: 12,
        marginBottom: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: theme.radius.md,
        gap: 8,
    },
    rejectBtn: {
        backgroundColor: `${theme.colors.danger}15`,
    },
    rejectText: {
        fontFamily: theme.fonts.button,
        fontSize: 15,
        color: theme.colors.danger,
    },
    approveBtn: {
        backgroundColor: theme.colors.teal,
        ...theme.shadows.tealGlow,
    },
    approveText: {
        fontFamily: theme.fonts.button,
        fontSize: 15,
        color: theme.colors.white,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontFamily: theme.fonts.headingL,
        fontSize: 20,
        color: theme.colors.textPrimary,
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtext: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
