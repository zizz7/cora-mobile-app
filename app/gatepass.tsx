import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useGatePasses, GatePass } from '../src/hooks/useGatePasses';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../src/theme/theme';
import PillHeader, { STATUSBAR_HEIGHT } from '../src/components/PillHeader';

export default function GatePassScreen() {
    const { data: passesData, isLoading, isError } = useGatePasses();
    const router = useRouter();

    const passes = passesData?.pages?.flatMap(page => page.data) || [];

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
                <Text style={styles.errorText}>Failed to load gate passes.</Text>
            </View>
        );
    }

    const renderStatusBadge = (status: string) => {
        let color = theme.colors.textSecondary;
        let bg = theme.colors.borderLight;
        if (status === 'Approved') {
            color = theme.colors.teal;
            bg = theme.colors.transparent.teal10;
        } else if (status === 'Pending') {
            color = theme.colors.orange;
            bg = theme.colors.transparent.pink10; // approximating orange bg
        } else if (status === 'Rejected') {
            color = theme.colors.danger;
            bg = theme.colors.transparent.pink10;
        }

        return (
            <View style={[styles.badge, { backgroundColor: bg }]}>
                <Text style={[styles.badgeText, { color }]}>{status}</Text>
            </View>
        );
    };

    const renderPass = useCallback(({ item }: { item: GatePass }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.passNumber}>{item.gatepass_number}</Text>
                    {renderStatusBadge(item.status)}
                </View>

                <Text style={styles.dateText}>Date: {item.gatepass_date}</Text>

                <View style={styles.refBox}>
                    <Text style={styles.refType}>{item.reference_type}</Text>
                    <Text style={styles.refValue} numberOfLines={2}>{item.reference_value}</Text>
                </View>

                {!!item.supplier_business_name && (
                    <Text style={styles.supplierText} numberOfLines={2}>Supplier: {item.supplier_business_name}</Text>
                )}

                <View style={styles.itemsSummary}>
                    <Ionicons name="cube-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.itemsText}>
                        {item.items?.length || 0} item(s) included
                    </Text>
                </View>
            </View>
        );
    }, []);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="Gate Passes" />

            <FlashList
                data={passes}
                renderItem={renderPass}
                keyExtractor={item => item.gatepass_id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>No Gate Passes</Text>
                        <Text style={styles.emptySubtext}>You have not created any gate passes.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/create-gatepass')}
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
        marginBottom: 8,
    },
    passNumber: {
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.pill,
    },
    badgeText: {
        fontFamily: theme.fonts.label,
        fontSize: 12,
    },
    dateText: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 12,
    },
    refBox: {
        backgroundColor: theme.colors.bgPage,
        padding: 12,
        borderRadius: theme.radius.sm,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    refType: {
        fontFamily: theme.fonts.label,
        fontSize: 13,
        color: theme.colors.textSecondary,
        flexShrink: 0,
        marginRight: 8,
    },
    refValue: {
        fontFamily: theme.fonts.headingS,
        fontSize: 14,
        color: theme.colors.textPrimary,
        flexShrink: 1,
        textAlign: 'right',
    },
    supplierText: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    itemsSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        paddingTop: 12,
    },
    itemsText: {
        fontFamily: theme.fonts.bodyS,
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginLeft: 6,
    },
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
