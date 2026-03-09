import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, StatusBar, Modal, TextInput, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { usePendingGatePasses, useApproveGatePass } from '../../src/hooks/useGatePasses';
import { useAuth } from '../../src/context/AuthContext';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme/theme';
import PillHeader, { STATUSBAR_HEIGHT } from '../../src/components/PillHeader';
import AnimatedPressable from '../../src/components/AnimatedPressable';

export default function GatePassApprovalsScreen() {
    const { data: gatePassesPage, isLoading, isError, refetch } = usePendingGatePasses();
    const approveMutation = useApproveGatePass();

    const [modalVisible, setModalVisible] = useState(false);
    const [actionData, setActionData] = useState<{ id: number; action: 'approve' | 'reject'; } | null>(null);
    const [remarks, setRemarks] = useState('');

    const pendingApprovals = gatePassesPage?.pages?.flatMap(page => page.data) || [];

    const confirmAction = (id: number, action: 'approve' | 'reject') => {
        setActionData({ id, action });
        setRemarks('');
        setModalVisible(true);
    };

    const submitAction = () => {
        if (!actionData) return;

        if (actionData.action === 'reject' && !remarks.trim()) {
            Alert.alert('Required', 'Please enter a reason for rejection.');
            return;
        }

        approveMutation.mutate({
            id: actionData.id,
            action: actionData.action,
            remarks: actionData.action === 'approve' ? remarks : undefined,
            rejection_reason: actionData.action === 'reject' ? remarks : undefined,
        }, {
            onSuccess: () => {
                Alert.alert('Success', `Gate pass ${actionData.action}d successfully.`);
                setModalVisible(false);
                refetch();
            },
            onError: (error: any) => {
                Alert.alert('Error', error?.response?.data?.message || `Failed to ${actionData.action} gate pass.`);
            }
        });
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
                <Text style={styles.errorText}>Failed to load pending gate passes.</Text>
            </View>
        );
    }

    const renderApprovalItem = useCallback(({ item }: { item: any }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarText}>{item.prepared_by_name?.charAt(0) || 'U'}</Text>
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{item.prepared_by_name}</Text>
                            <Text style={styles.userDept}>{item.prepared_by_department}</Text>
                        </View>
                    </View>
                    <View style={styles.badgePending}>
                        <Text style={styles.badgeText}>Level: {item.current_approval_step?.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                        <Ionicons name="document-text-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.detailText} numberOfLines={2}>{item.gatepass_number}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.detailText} numberOfLines={2}>{item.gatepass_date}</Text>
                    </View>
                    <View style={styles.detailItemFull}>
                        <Ionicons name="cube-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.detailText} numberOfLines={2}>{item.total_packages} Packages - {item.supplier_business_name}</Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <AnimatedPressable
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => confirmAction(item.gatepass_id, 'reject')}
                        scaleTo={0.95}
                    >
                        <Ionicons name="close-circle-outline" size={20} color={theme.colors.danger} />
                        <Text style={styles.rejectText}>Decline</Text>
                    </AnimatedPressable>
                    <AnimatedPressable
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => confirmAction(item.gatepass_id, 'approve')}
                        scaleTo={0.95}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.white} />
                        <Text style={styles.approveText}>Approve</Text>
                    </AnimatedPressable>
                </View>
            </View>
        );
    }, [approveMutation]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="Gate Pass Approvals" />

            <FlashList
                data={pendingApprovals}
                keyExtractor={(item) => item.gatepass_id.toString()}
                renderItem={renderApprovalItem}
                contentContainerStyle={[styles.listContent, { paddingTop: STATUSBAR_HEIGHT + 60 }]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="clipboard-check-outline" size={64} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>You're all caught up!</Text>
                        <Text style={styles.emptySubtext}>No pending gate passes require your approval.</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {actionData?.action === 'approve' ? 'Approve' : 'Reject'} Gate Pass
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            {actionData?.action === 'approve'
                                ? 'Add any optional remarks for this approval step.'
                                : 'Please provide a reason for rejecting this gate pass.'}
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter remarks..."
                            placeholderTextColor={theme.colors.textTertiary}
                            multiline
                            autoFocus
                            value={remarks}
                            onChangeText={setRemarks}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSubmit, actionData?.action === 'reject' && { backgroundColor: theme.colors.danger }]}
                                onPress={submitAction}
                            >
                                {approveMutation.isPending ? (
                                    <ActivityIndicator color={theme.colors.white} />
                                ) : (
                                    <Text style={styles.modalSubmitText}>
                                        {actionData?.action === 'approve' ? 'Approve' : 'Reject'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.transparent.teal10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontFamily: theme.fonts.headingM,
        fontSize: 18,
        color: theme.colors.teal,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontFamily: theme.fonts.headingS,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    userDept: {
        fontFamily: theme.fonts.bodyS,
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    badgePending: {
        backgroundColor: theme.colors.transparent.pink10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radius.sm,
    },
    badgeText: {
        fontFamily: theme.fonts.label,
        fontSize: 11,
        color: theme.colors.orange,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '45%',
    },
    detailItemFull: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 4,
    },
    detailText: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 13,
        color: theme.colors.textPrimary,
        marginLeft: 6,
        flexShrink: 1,
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
        borderWidth: 1,
    },
    rejectBtn: {
        backgroundColor: theme.colors.transparent.pink10,
        borderColor: theme.colors.danger,
    },
    approveBtn: {
        backgroundColor: theme.colors.teal,
        borderColor: theme.colors.teal,
    },
    rejectText: {
        fontFamily: theme.fonts.button,
        fontSize: 14,
        color: theme.colors.danger,
        marginLeft: 6,
    },
    approveText: {
        fontFamily: theme.fonts.button,
        fontSize: 14,
        color: theme.colors.white,
        marginLeft: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontFamily: theme.fonts.headingM,
        fontSize: 18,
        color: theme.colors.textPrimary,
        marginTop: 16,
    },
    emptySubtext: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: 24,
        width: '100%',
        ...theme.shadows.level3,
    },
    modalTitle: {
        fontFamily: theme.fonts.headingM,
        fontSize: 18,
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: theme.colors.bgPage,
        borderWidth: 1,
        borderColor: theme.colors.borderMid,
        borderRadius: theme.radius.sm,
        padding: 12,
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textPrimary,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalCancel: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    modalCancelText: {
        fontFamily: theme.fonts.button,
        fontSize: 15,
        color: theme.colors.textSecondary,
    },
    modalSubmit: {
        backgroundColor: theme.colors.teal,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: theme.radius.sm,
    },
    modalSubmitText: {
        fontFamily: theme.fonts.button,
        fontSize: 15,
        color: theme.colors.white,
    },
});
