/**
 * Admin Settings Screen — User management & system controls.
 * Accessible to Admin/Super Admin only via More menu.
 */
import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, Modal, ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminUsers, useUpdateUser, useResetPassword, useToggleUserStatus, AdminUser, UpdateUserPayload } from '../../src/hooks/useAdmin';
import { theme } from '../../src/theme/theme';

const ROLES = ['Employee', 'HOD', 'Manager', 'Assistant Manager', 'Human Resources', 'Executive Office', 'Security', 'Admin', 'Super Admin'];

export default function AdminScreen() {
    const { data: users, isLoading, isError, refetch } = useAdminUsers();
    const updateUser = useUpdateUser();
    const resetPassword = useResetPassword();
    const toggleStatus = useToggleUserStatus();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [editRole, setEditRole] = useState('');
    const [editDepartment, setEditDepartment] = useState('');
    const [editPosition, setEditPosition] = useState('');
    const [editLedgerLimit, setEditLedgerLimit] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        if (!searchQuery.trim()) return users;
        const q = searchQuery.toLowerCase();
        return users.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.user_id.toLowerCase().includes(q) ||
            u.department.toLowerCase().includes(q) ||
            u.role_name.toLowerCase().includes(q)
        );
    }, [users, searchQuery]);

    const openEditModal = (user: AdminUser) => {
        setSelectedUser(user);
        setEditRole(user.role_name);
        setEditDepartment(user.department);
        setEditPosition(user.position);
        setEditLedgerLimit(user.city_ledger_limit != null ? String(user.city_ledger_limit) : '');
        setShowEditModal(true);
    };

    const handleSave = () => {
        if (!selectedUser) return;
        const payload: UpdateUserPayload = {};
        if (editRole !== selectedUser.role_name) payload.role_name = editRole;
        if (editDepartment !== selectedUser.department) payload.department = editDepartment;
        if (editPosition !== selectedUser.position) payload.position = editPosition;
        const newLimit = editLedgerLimit ? Number(editLedgerLimit) : null;
        if (newLimit !== selectedUser.city_ledger_limit) payload.city_ledger_limit = newLimit;

        if (Object.keys(payload).length === 0) {
            setShowEditModal(false);
            return;
        }

        updateUser.mutate({ userId: selectedUser.user_id, payload }, {
            onSuccess: () => {
                Alert.alert('Success', `${selectedUser.name}'s profile updated.`);
                setShowEditModal(false);
            },
            onError: () => Alert.alert('Error', 'Failed to update user.'),
        });
    };

    const handleResetPassword = (user: AdminUser) => {
        Alert.alert(
            'Reset Password',
            `Reset password for ${user.name}? They will receive a temporary password via email.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset', style: 'destructive',
                    onPress: () => {
                        resetPassword.mutate(user.user_id, {
                            onSuccess: () => Alert.alert('Done', 'Password has been reset.'),
                            onError: () => Alert.alert('Error', 'Failed to reset password.'),
                        });
                    },
                },
            ]
        );
    };

    const handleToggleStatus = (user: AdminUser) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        Alert.alert(
            `${newStatus === 'active' ? 'Activate' : 'Deactivate'} User`,
            `${newStatus === 'active' ? 'Activate' : 'Deactivate'} ${user.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        toggleStatus.mutate({ userId: user.user_id, status: newStatus }, {
                            onSuccess: () => refetch(),
                            onError: () => Alert.alert('Error', 'Failed to update status.'),
                        });
                    },
                },
            ]
        );
    };

    const renderUser = ({ item }: { item: AdminUser }) => {
        const isActive = item.status === 'active';
        return (
            <TouchableOpacity style={styles.userCard} onPress={() => openEditModal(item)} activeOpacity={0.7}>
                <View style={styles.userLeft}>
                    <View style={[styles.statusDot, { backgroundColor: isActive ? theme.colors.teal : theme.colors.danger }]} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.userId}>{item.user_id} · {item.department}</Text>
                    </View>
                </View>
                <View style={styles.userRight}>
                    <View style={[styles.rolePill, {
                        backgroundColor: item.role_name.includes('Admin') ? theme.colors.transparent.teal10 : theme.colors.bgPage
                    }]}>
                        <Text style={[styles.roleText, {
                            color: item.role_name.includes('Admin') ? theme.colors.teal : theme.colors.textSecondary
                        }]}>{item.role_name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => openEditModal(item)} hitSlop={8}>
                        <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <Stack.Screen options={{ headerShown: true, headerTitle: 'Admin Settings', headerBackTitle: 'Back' }} />
                <ActivityIndicator size="large" color={theme.colors.teal} />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Stack.Screen options={{ headerShown: true, headerTitle: 'Admin Settings', headerBackTitle: 'Back' }} />
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textTertiary} />
                <Text style={styles.errorText}>Unable to load admin data</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: 'Admin Settings',
                headerBackTitle: 'Back',
                headerStyle: { backgroundColor: theme.colors.bgPage },
                headerTintColor: theme.colors.textPrimary,
                headerShadowVisible: false,
                headerTitleStyle: { fontFamily: theme.fonts.headingM },
            }} />

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{users?.length || 0}</Text>
                    <Text style={styles.statLabel}>Total Users</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{users?.filter(u => u.status === 'active').length || 0}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{new Set(users?.map(u => u.department)).size || 0}</Text>
                    <Text style={styles.statLabel}>Depts</Text>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* User List */}
            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUser}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Edit User Modal */}
            <Modal visible={showEditModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{selectedUser?.name}</Text>
                                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSubtitle}>{selectedUser?.user_id} · {selectedUser?.department}</Text>

                            {/* Role Selector */}
                            <Text style={styles.fieldLabel}>Role</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleSelector}>
                                {ROLES.map(role => (
                                    <TouchableOpacity
                                        key={role}
                                        style={[styles.roleChip, editRole === role && styles.roleChipActive]}
                                        onPress={() => setEditRole(role)}
                                    >
                                        <Text style={[styles.roleChipText, editRole === role && styles.roleChipTextActive]}>
                                            {role}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Department */}
                            <Text style={styles.fieldLabel}>Department</Text>
                            <TextInput
                                style={styles.input}
                                value={editDepartment}
                                onChangeText={setEditDepartment}
                                placeholder="Department"
                                placeholderTextColor={theme.colors.textTertiary}
                            />

                            {/* Position */}
                            <Text style={styles.fieldLabel}>Position</Text>
                            <TextInput
                                style={styles.input}
                                value={editPosition}
                                onChangeText={setEditPosition}
                                placeholder="Position"
                                placeholderTextColor={theme.colors.textTertiary}
                            />

                            {/* Ledger Limit */}
                            <Text style={styles.fieldLabel}>City Ledger Limit ($)</Text>
                            <TextInput
                                style={styles.input}
                                value={editLedgerLimit}
                                onChangeText={setEditLedgerLimit}
                                placeholder="e.g. 500"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.textTertiary}
                            />

                            {/* Action Buttons */}
                            <TouchableOpacity
                                style={[styles.saveButton, updateUser.isPending && { opacity: 0.6 }]}
                                onPress={handleSave}
                                disabled={updateUser.isPending}
                            >
                                <Text style={styles.saveButtonText}>
                                    {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.dangerSection}>
                                <TouchableOpacity style={styles.dangerBtn} onPress={() => selectedUser && handleResetPassword(selectedUser)}>
                                    <Ionicons name="key-outline" size={18} color={theme.colors.orange} />
                                    <Text style={styles.dangerBtnText}>Reset Password</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.dangerBtn} onPress={() => selectedUser && handleToggleStatus(selectedUser)}>
                                    <Ionicons
                                        name={selectedUser?.status === 'active' ? 'person-remove-outline' : 'person-add-outline'}
                                        size={18}
                                        color={selectedUser?.status === 'active' ? theme.colors.danger : theme.colors.teal}
                                    />
                                    <Text style={[styles.dangerBtnText, {
                                        color: selectedUser?.status === 'active' ? theme.colors.danger : theme.colors.teal,
                                    }]}>
                                        {selectedUser?.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
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
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginTop: 12,
    },
    // Stats Bar
    statsBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 16,
        borderRadius: theme.radius.xl,
        padding: 16,
        ...theme.shadows.level1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontFamily: theme.fonts.amount,
        fontSize: 22,
        color: theme.colors.teal,
    },
    statLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 10,
        color: theme.colors.textSecondary,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        backgroundColor: theme.colors.borderLight,
        marginVertical: 4,
    },
    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        marginHorizontal: 20,
        marginBottom: 12,
        paddingHorizontal: 14,
        height: 44,
        borderRadius: theme.radius.lg,
        gap: 8,
        ...theme.shadows.level1,
    },
    searchInput: {
        flex: 1,
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: theme.colors.textPrimary,
        height: '100%',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    // User Card
    userCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: 14,
        marginBottom: 8,
        ...theme.shadows.level1,
    },
    userLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    userName: {
        fontFamily: theme.fonts.headingM,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    userId: {
        fontFamily: theme.fonts.caption,
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    userRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rolePill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.pill,
    },
    roleText: {
        fontFamily: theme.fonts.label,
        fontSize: 10,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    modalTitle: {
        fontFamily: theme.fonts.headingL,
        fontSize: 22,
        color: theme.colors.textPrimary,
    },
    modalSubtitle: {
        fontFamily: theme.fonts.caption,
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: 24,
    },
    fieldLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 11,
        color: theme.colors.textSecondary,
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: theme.colors.bgPage,
        borderRadius: theme.radius.md,
        paddingHorizontal: 16,
        height: 48,
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    roleSelector: {
        marginBottom: 8,
    },
    roleChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.bgPage,
        marginRight: 8,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    roleChipActive: {
        backgroundColor: theme.colors.teal,
        borderColor: theme.colors.teal,
    },
    roleChipText: {
        fontFamily: theme.fonts.button,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    roleChipTextActive: {
        color: theme.colors.white,
    },
    saveButton: {
        backgroundColor: theme.colors.teal,
        height: 52,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    saveButtonText: {
        fontFamily: theme.fonts.button,
        fontSize: 16,
        color: theme.colors.white,
    },
    dangerSection: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        gap: 12,
        marginBottom: 32,
    },
    dangerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
    },
    dangerBtnText: {
        fontFamily: theme.fonts.button,
        fontSize: 14,
        color: theme.colors.orange,
    },
});
