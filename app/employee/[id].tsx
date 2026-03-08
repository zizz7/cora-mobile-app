/**
 * Employee Profile Detail Screen.
 * Displays full employee info when navigating from Directory.
 * Premium design: ocean gradient hero, white info cards.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEmployee } from '../../src/hooks/useDirectory';
import { theme } from '../../src/theme/theme';

export default function EmployeeProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { data: employee, isLoading, isError } = useEmployee(id || '');

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const handleCall = () => {
        if (employee?.phone_number) {
            Linking.openURL(`tel:${employee.phone_number}`);
        }
    };

    const handleEmail = () => {
        if (employee?.email) {
            Linking.openURL(`mailto:${employee.email}`);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <Stack.Screen options={{
                    headerShown: true,
                    headerTitle: '',
                    headerBackTitle: 'Back',
                    headerStyle: { backgroundColor: theme.colors.bgPage },
                    headerTintColor: theme.colors.textPrimary,
                    headerShadowVisible: false,
                }} />
                <ActivityIndicator size="large" color={theme.colors.teal} />
            </View>
        );
    }

    if (isError || !employee) {
        return (
            <View style={styles.centerContainer}>
                <Stack.Screen options={{
                    headerShown: true,
                    headerTitle: 'Employee',
                    headerBackTitle: 'Back',
                    headerStyle: { backgroundColor: theme.colors.bgPage },
                    headerTintColor: theme.colors.textPrimary,
                    headerShadowVisible: false,
                }} />
                <Ionicons name="alert-circle-outline" size={56} color={theme.colors.textTertiary} />
                <Text style={styles.errorText}>Unable to load profile</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
                    <Text style={styles.retryText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const joinDate = employee.join_date
        ? new Date(employee.join_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    const birthday = (employee.birth_date || employee.date_of_birth)
        ? new Date(employee.birth_date || employee.date_of_birth || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
        : null;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Ocean Gradient Hero */}
                <LinearGradient
                    colors={theme.gradients.ocean as readonly [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.hero}
                >
                    {/* Back button */}
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
                    </TouchableOpacity>

                    {/* Watermark icon */}
                    <MaterialCommunityIcons
                        name="account-circle-outline"
                        size={200}
                        color="rgba(255,255,255,0.06)"
                        style={styles.heroBgIcon}
                    />

                    {/* Avatar */}
                    <View style={styles.avatarRing}>
                        {employee.avatar_url ? (
                            <Image source={{ uri: employee.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarText}>{getInitials(employee.name)}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.heroName}>{employee.name}</Text>
                    <Text style={styles.heroPosition}>{employee.position}</Text>

                    <View style={styles.departmentPill}>
                        <Text style={styles.departmentText}>{employee.department}</Text>
                    </View>
                </LinearGradient>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, !employee.phone_number && styles.actionBtnDisabled]}
                        onPress={handleCall}
                        disabled={!employee.phone_number}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIconBg, { backgroundColor: theme.colors.transparent.teal10 }]}>
                            <Ionicons name="call-outline" size={22} color={theme.colors.teal} />
                        </View>
                        <Text style={styles.actionLabel}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, !employee.email && styles.actionBtnDisabled]}
                        onPress={handleEmail}
                        disabled={!employee.email}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIconBg, { backgroundColor: theme.colors.transparent.teal10 }]}>
                            <Ionicons name="mail-outline" size={22} color={theme.colors.teal} />
                        </View>
                        <Text style={styles.actionLabel}>Email</Text>
                    </TouchableOpacity>
                </View>

                {/* Info Cards */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    {employee.phone_number && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="call-outline" size={18} color={theme.colors.teal} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Phone</Text>
                                <Text style={styles.infoValue}>{employee.phone_number}</Text>
                            </View>
                        </View>
                    )}

                    {employee.email && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="mail-outline" size={18} color={theme.colors.orange} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{employee.email}</Text>
                            </View>
                        </View>
                    )}

                    {employee.user_id && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="id-card-outline" size={18} color={theme.colors.blue} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Employee ID</Text>
                                <Text style={styles.infoValue}>{employee.user_id}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="briefcase-outline" size={18} color={theme.colors.teal} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Department</Text>
                            <Text style={styles.infoValue}>{employee.department}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="ribbon-outline" size={18} color={theme.colors.orange} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Position</Text>
                            <Text style={styles.infoValue}>{employee.position}</Text>
                        </View>
                    </View>

                    {joinDate && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="calendar-outline" size={18} color={theme.colors.blue} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Joined</Text>
                                <Text style={styles.infoValue}>{joinDate}</Text>
                            </View>
                        </View>
                    )}

                    {birthday && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <MaterialCommunityIcons name="cake-variant-outline" size={18} color={theme.colors.pink} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Birthday</Text>
                                <Text style={styles.infoValue}>{birthday}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
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
        marginTop: 16,
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.teal,
    },
    retryText: {
        fontFamily: theme.fonts.button,
        fontSize: 14,
        color: theme.colors.white,
    },
    // ─── Hero ──────────────────────────────
    hero: {
        paddingTop: Platform.OS === 'ios' ? 60 : 48,
        paddingBottom: 36,
        alignItems: 'center',
        overflow: 'hidden',
    },
    backBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 40,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    heroBgIcon: {
        position: 'absolute',
        top: -20,
        right: -40,
        transform: [{ rotate: '-15deg' }],
    },
    avatarRing: {
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
        padding: 4,
        marginBottom: 16,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 52,
    },
    avatarPlaceholder: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: theme.fonts.display,
        fontSize: 36,
        color: theme.colors.white,
    },
    heroName: {
        fontFamily: theme.fonts.display,
        fontSize: 28,
        color: theme.colors.white,
        textAlign: 'center',
    },
    heroPosition: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
        textAlign: 'center',
    },
    departmentPill: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    departmentText: {
        fontFamily: theme.fonts.label,
        fontSize: 11,
        color: theme.colors.white,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    // ─── Actions ───────────────────────────
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    actionBtn: {
        alignItems: 'center',
        gap: 6,
    },
    actionBtnDisabled: {
        opacity: 0.4,
    },
    actionIconBg: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 11,
        color: theme.colors.textSecondary,
        letterSpacing: 0.5,
    },
    // ─── Info Sections ─────────────────────
    section: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.xl,
        padding: 20,
        ...theme.shadows.level1,
    },
    sectionTitle: {
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.borderLight,
    },
    infoIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.bgPage,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 10,
        color: theme.colors.textTertiary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    infoValue: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
});
