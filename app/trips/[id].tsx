import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTrip, useJoinTrip } from '../../src/hooks/useTrips';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../src/theme/theme';

export default function TripDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { data: trip, isLoading, isError } = useTrip(Number(id));
    const joinMutation = useJoinTrip();

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.teal} />
            </View>
        );
    }

    if (isError || !trip) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load trip details.</Text>
            </View>
        );
    }

    const remainingSpots = trip.max_participants - trip.current_participants;
    const isFull = remainingSpots <= 0;
    const isAlmostFull = !isFull && remainingSpots <= 3;

    // Status styles
    let statusBg = theme.colors.transparent.teal10;
    let statusTextColor = theme.colors.teal;
    let statusLabel = 'OPEN';

    if (isFull) {
        statusBg = theme.colors.transparent.pink10;
        statusTextColor = theme.colors.pink;
        statusLabel = 'FULLY BOOKED';
    } else if (isAlmostFull) {
        statusBg = 'rgba(249, 160, 63, 0.1)'; // Fallback since warning10 is not in theme
        statusTextColor = theme.colors.orange;
        statusLabel = 'ALMOST FULL';
    }

    const handleJoin = () => {
        Alert.alert(
            "Join Trip",
            `Are you sure you want to join ${trip.trip_name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: () => {
                        joinMutation.mutate(Number(id), {
                            onSuccess: () => {
                                Alert.alert("Success", "You have joined the trip successfully!");
                                router.back();
                            },
                            onError: (error: any) => {
                                Alert.alert("Error", error?.message || "Failed to join trip. It might be full or you are already joined.");
                            }
                        });
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{
                title: 'Trip Details',
                headerBackTitle: 'Back',
                headerStyle: { backgroundColor: theme.colors.bgPage },
                headerTintColor: theme.colors.textPrimary,
                headerTitleStyle: { fontFamily: theme.fonts.headingM, color: theme.colors.textPrimary },
                headerShadowVisible: false,
            }} />

            <LinearGradient
                colors={theme.gradients.ocean as readonly [string, string, ...string[]]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.heroCard}
            >
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusText, { color: statusTextColor }]}>
                        {statusLabel}
                    </Text>
                </View>
                <Text style={styles.title}>{trip.trip_name}</Text>
                {trip.creator && <Text style={styles.subtitle}>Organized by {trip.creator.name} ({trip.creator.department})</Text>}
            </LinearGradient>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Description</Text>
                <Text style={styles.descriptionText}>{trip.trip_description}</Text>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.transparent.teal10 }]}>
                        <MaterialCommunityIcons name="calendar-export" size={24} color={theme.colors.teal} />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Departure</Text>
                        <Text style={styles.infoValue}>{trip.departure_date} at {trip.departure_time}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.transparent.teal10 }]}>
                        <MaterialCommunityIcons name="calendar-import" size={24} color={theme.colors.teal} />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Return</Text>
                        <Text style={styles.infoValue}>{trip.return_date} at {trip.return_time}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(10, 37, 64, 0.1)' }]}>
                        <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.blue} />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Location</Text>
                        <Text style={styles.infoValue}>{trip.departure_location}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(249, 160, 63, 0.1)' }]}>
                        <MaterialCommunityIcons name="account-group" size={24} color={theme.colors.orange} />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Participants</Text>
                        <Text style={styles.infoValue}>{trip.current_participants} joined / {trip.max_participants} total</Text>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${(trip.current_participants / trip.max_participants) * 100}%`, backgroundColor: isFull ? theme.colors.pink : theme.colors.teal }]} />
                        </View>
                        {trip.participants && trip.participants.length > 0 && (
                            <View style={styles.participantsContainer}>
                                {trip.participants.slice(0, 5).map((p, index) => (
                                    <Image
                                        key={p.user.id}
                                        source={{ uri: p.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.name)}&background=random` }}
                                        style={[styles.participantAvatar, { marginLeft: index > 0 ? -12 : 0 }]}
                                    />
                                ))}
                                {trip.participants.length > 5 && (
                                    <View style={[styles.participantAvatar, styles.moreParticipantsBadge]}>
                                        <Text style={styles.moreParticipantsText}>+{trip.participants.length - 5}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.actionButton, (isFull || joinMutation.isPending) && styles.actionButtonDisabled]}
                disabled={isFull || joinMutation.isPending}
                onPress={handleJoin}
                activeOpacity={0.8}
            >
                {joinMutation.isPending ? (
                    <ActivityIndicator color={theme.colors.white} />
                ) : (
                    <>
                        <MaterialCommunityIcons
                            name={isFull ? "account-cancel" : "check-circle"}
                            size={20}
                            color={theme.colors.white}
                            style={{ marginRight: 8 }}
                        />
                        <Text style={styles.actionButtonText}>
                            {isFull ? 'Trip Full' : 'Join Trip'}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
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
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    heroCard: {
        borderRadius: theme.radius.xl,
        padding: 24,
        marginBottom: 24,
        alignItems: 'flex-start',
        ...theme.shadows.level2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
        marginBottom: 16,
    },
    statusText: {
        fontFamily: theme.fonts.label,
        fontSize: 12,
        letterSpacing: 0.5,
    },
    title: {
        fontFamily: theme.fonts.display,
        fontSize: 28,
        color: theme.colors.white,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontFamily: theme.fonts.headingM,
        fontSize: 18,
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    descriptionText: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    infoCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.xl,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.level1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    infoValue: {
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: theme.colors.borderLight,
        borderRadius: theme.radius.pill,
        marginTop: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: theme.radius.pill,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.borderLight,
        marginVertical: 16,
    },
    actionButton: {
        backgroundColor: theme.colors.teal,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: theme.radius.lg,
        ...theme.shadows.tealGlow,
    },
    actionButtonDisabled: {
        backgroundColor: theme.colors.textTertiary,
        shadowOpacity: 0,
        elevation: 0,
    },
    actionButtonText: {
        fontFamily: theme.fonts.button,
        color: theme.colors.white,
        fontSize: 16,
    },
    participantsContainer: {
        flexDirection: 'row',
        marginTop: 12,
        alignItems: 'center',
    },
    participantAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.colors.white,
        backgroundColor: theme.colors.white,
    },
    moreParticipantsBadge: {
        backgroundColor: theme.colors.transparent.teal10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -12,
    },
    moreParticipantsText: {
        fontFamily: theme.fonts.label,
        fontSize: 10,
        color: theme.colors.textSecondary,
    }
});
