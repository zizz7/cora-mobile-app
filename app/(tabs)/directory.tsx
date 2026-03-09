/**
 * Directory Screen — Staff directory with role-based filtering.
 * HODs see own department; Admins see everyone.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { useDirectory, Employee } from '../../src/hooks/useDirectory';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import AnimatedPressable from '../../src/components/AnimatedPressable';
import { theme } from '../../src/theme/theme';
import PillHeader, { STATUSBAR_HEIGHT } from '../../src/components/PillHeader';

const ADMIN_ROLES = new Set(['Admin', 'Super Admin']);

export default function DirectoryScreen() {
    const { data: directoryData, isLoading, isError } = useDirectory();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    // Department-based filtering: Admins see all, HODs/Managers see own department
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const renderBirthday = useCallback(({ item }: { item: Employee }) => (
        <AnimatedPressable
            style={styles.birthdayCard}
            onPress={() => router.push(`/employee/${item.user_id}`)}
        >
            <View style={styles.birthdayAvatarContainer}>
                {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.birthdayAvatar} />
                ) : (
                    <View style={[styles.birthdayAvatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarTextSm}>{getInitials(item.name)}</Text>
                    </View>
                )}
                <View style={styles.birthdayBadge}>
                    <MaterialCommunityIcons name="cake-variant" size={10} color="#FFF" />
                </View>
            </View>
            <Text style={styles.birthdayName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
            <Text style={styles.birthdayDate}>
                {item.date_of_birth ? new Date(item.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
            </Text>
        </AnimatedPressable>
    ), []);

    const renderEmployee = useCallback(({ item }: { item: Employee }) => (
        <AnimatedPressable
            style={styles.card}
            onPress={() => router.push(`/employee/${item.user_id}`)}
        >
            <View style={styles.avatarContainer}>
                {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.position} numberOfLines={1}>{item.position}</Text>

                <View style={styles.departmentBadge}>
                    <Text style={styles.departmentText}>{item.department}</Text>
                </View>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialCommunityIcons name="phone-outline" size={20} color={theme.colors.teal} />
                </TouchableOpacity>
            </View>
        </AnimatedPressable>
    ), []);

    const employees = useMemo(() => {
        const all = directoryData?.directory?.data || [];
        if (!user) return all;
        if (ADMIN_ROLES.has(user.role_name)) return all;
        // HODs, Managers, and other non-admin roles see their own department
        return all.filter(emp => emp.department === user.department);
    }, [directoryData, user]);

    const upcomingBirthdays = useMemo(() => {
        const all = directoryData?.upcoming_birthdays || [];
        if (!user) return all;
        if (ADMIN_ROLES.has(user.role_name)) return all;
        return all.filter(emp => emp.department === user.department);
    }, [directoryData, user]);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.teal} />
            </View>
        );
    }

    if (isError || !directoryData) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load directory.</Text>
            </View>
        );
    }

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const departmentLabel = user && !ADMIN_ROLES.has(user.role_name)
        ? `${user.department} — ${filteredEmployees.length} staff`
        : `All Departments — ${filteredEmployees.length} staff`;

    return (
        <View style={styles.screenContainer}>
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="Directory" showBack={false} />

            {/* Department indicator */}
            <View style={[styles.departmentIndicator, { marginTop: STATUSBAR_HEIGHT + 40 }]}>
                <MaterialCommunityIcons name="office-building-outline" size={14} color={theme.colors.teal} />
                <Text style={styles.departmentIndicatorText}>{departmentLabel}</Text>
            </View>

            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, position, department..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                        <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                )}
            </View>

            <FlashList
                data={filteredEmployees}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEmployee}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    upcomingBirthdays.length > 0 && searchQuery === '' ? (
                        <View style={styles.birthdaysSection}>
                            <Text style={styles.sectionTitle}>Upcoming Birthdays 🎉</Text>
                            <FlatList
                                horizontal
                                data={upcomingBirthdays}
                                keyExtractor={(item) => item.id.toString() + '_bd'}
                                renderItem={renderBirthday}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.birthdaysList}
                            />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="account-search-outline" size={64} color={theme.colors.borderLight} />
                        <Text style={styles.emptyText}>No employees found.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
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
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.danger,
    },
    departmentIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
    },
    departmentIndicatorText: {
        fontFamily: theme.fonts.label,
        fontSize: 11,
        color: theme.colors.textSecondary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 48,
        borderRadius: theme.radius.lg,
        ...theme.shadows.level1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textPrimary,
        height: '100%',
    },
    clearIcon: {
        padding: 6,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    // Birthdays
    birthdaysSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    birthdaysList: {
        paddingRight: 20,
    },
    birthdayCard: {
        alignItems: 'center',
        marginRight: 12,
        width: 72,
    },
    birthdayAvatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    birthdayAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.teal,
        borderWidth: 2,
        borderColor: theme.colors.white,
    },
    birthdayBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: theme.colors.orange,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.white,
    },
    birthdayName: {
        fontFamily: theme.fonts.button,
        fontSize: 12,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    birthdayDate: {
        fontFamily: theme.fonts.label,
        fontSize: 9,
        color: theme.colors.teal,
    },
    // Employee List
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.xl,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        ...theme.shadows.level1,
    },
    avatarContainer: {
        marginRight: 14,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.bgPage,
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.teal,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: theme.fonts.headingM,
        color: theme.colors.white,
        fontSize: 18,
        letterSpacing: 1,
    },
    avatarTextSm: {
        fontFamily: theme.fonts.headingM,
        color: theme.colors.white,
        fontSize: 20,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    position: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    departmentBadge: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.transparent.teal10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.pill,
    },
    departmentText: {
        fontFamily: theme.fonts.label,
        fontSize: 10,
        color: theme.colors.teal,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    actionContainer: {
        paddingLeft: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.transparent.teal10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
    },
    emptyText: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        marginTop: 12,
        color: theme.colors.textTertiary,
    },
});
