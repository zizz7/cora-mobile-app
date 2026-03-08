import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNotifications, useMarkNotificationRead, useMarkAllRead, NotificationItem } from '../../src/hooks/useNotifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radii, Shadows, CommonStyles } from '../../src/theme';
import AnimatedPressable from '../../src/components/AnimatedPressable';

export default function NotificationsScreen() {
    const { data: notifications, isLoading, isError } = useNotifications();
    const markAsRead = useMarkNotificationRead();
    const markAllRead = useMarkAllRead();
    const router = useRouter();

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.brandTeal} />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load notifications.</Text>
            </View>
        );
    }

    const unreadCount = notifications?.filter(n => !n.read_at).length || 0;

    const handlePress = (item: NotificationItem) => {
        if (!item.read_at) {
            markAsRead.mutate(item.id);
        }

        // Routing based on notification type
        const typeStr = item.type || item.data?.type || '';

        if (typeStr.includes('leave')) {
            router.push('/(tabs)/menu'); // Or specific leave screen
        } else if (typeStr.includes('event')) {
            if (item.data?.event_id) {
                router.push(`/event/${item.data.event_id}`);
            } else {
                router.push('/events');
            }
        } else if (typeStr.includes('trip')) {
            router.push('/trips');
        } else if (typeStr.includes('feed')) {
            router.push('/(tabs)'); // Home feed
        }
    };

    const handleMarkAllRead = () => {
        if (unreadCount > 0) {
            markAllRead.mutate();
        }
    };

    const renderNotification = ({ item }: { item: NotificationItem }) => {
        let iconName: any = 'bell-outline';
        let iconColor: string = Colors.primaryDark;
        let iconBg: string = Colors.surface;

        const typeStr = item.type || item.data?.type || '';

        if (typeStr.includes('message') || typeStr.includes('feed')) {
            iconName = 'message-text-outline';
            iconColor = '#3B82F6';
            iconBg = '#DBEAFE';
        } else if (typeStr.includes('event')) {
            iconName = 'calendar-star';
            iconColor = '#A855F7';
            iconBg = '#F3E8FF';
        } else if (typeStr.includes('leave')) {
            iconName = 'calendar-check-outline';
            iconColor = '#10B981';
            iconBg = '#D1FAE5';
        } else if (typeStr.includes('trip')) {
            iconName = 'ferry';
            iconColor = Colors.warning;
            iconBg = Colors.warningLight;
        }

        const isUnread = !item.read_at;

        // Ensure we safely extract title and message from data object
        const title = item.data?.title || 'Notification';
        const message = item.data?.message || '';

        return (
            <AnimatedPressable
                style={[styles.card, isUnread && styles.cardUnread]}
                onPress={() => handlePress(item)}
            >
                <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                    <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
                </View>

                <View style={styles.contentContainer}>
                    <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={2}>
                        {title}
                    </Text>
                    <Text style={[styles.message, isUnread && styles.messageUnread]} numberOfLines={2}>
                        {message}
                    </Text>
                    <Text style={styles.timeText}>
                        {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </Text>
                </View>

                {isUnread && (
                    <View style={styles.unreadDot} />
                )}
            </AnimatedPressable>
        );
    };

    return (
        <View style={CommonStyles.screenContainer}>
            <Stack.Screen
                options={{
                    title: 'Notifications',
                    headerBackTitle: 'Back',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.surface },
                    headerTitleStyle: Typography.h2,
                    headerRight: () => unreadCount > 0 ? (
                        <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerButton}>
                            <MaterialCommunityIcons name="check-all" size={22} color={Colors.brandTeal} />
                        </TouchableOpacity>
                    ) : null,
                }}
            />

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNotification}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="bell-sleep-outline" size={64} color={Colors.border} />
                        <Text style={styles.emptyText}>You're all caught up!</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    errorText: {
        ...Typography.body,
        color: Colors.danger,
    },
    headerButton: {
        padding: Spacing.sm,
        marginRight: Spacing.xs,
        backgroundColor: Colors.brandTealLight,
        borderRadius: Radii.pill,
    },
    listContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.bottomSafe,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: Radii.card,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        alignItems: 'center',
        ...Shadows.card,
    },
    cardUnread: {
        backgroundColor: Colors.card,
        borderColor: Colors.brandTealLight,
        borderWidth: 1,
        ...Shadows.cardHover,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    titleUnread: {
        color: Colors.primaryDark,
        fontWeight: '800',
    },
    message: {
        ...Typography.bodySmall,
        color: Colors.textTertiary,
        marginBottom: Spacing.sm,
        lineHeight: 18,
    },
    messageUnread: {
        color: Colors.textSecondary,
    },
    timeText: {
        ...Typography.label,
        color: Colors.textTertiary,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.brandTeal,
        marginLeft: Spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
    },
    emptyText: {
        ...Typography.body,
        marginTop: Spacing.md,
        color: Colors.textTertiary,
    }
});
