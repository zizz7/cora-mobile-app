import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useEvent, useRsvpEvent } from '../../src/hooks/useEvents';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { data: event, isLoading, isError } = useEvent(Number(id));
    const rsvpMutation = useRsvpEvent();

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#A855F7" />
            </View>
        );
    }

    if (isError || !event) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load event details.</Text>
            </View>
        );
    }

    const remainingSpots = event.max_participants - event.current_participants;
    const isFull = remainingSpots <= 0;

    const handleRSVP = () => {
        Alert.alert(
            "RSVP Event",
            `Are you sure you want to RSVP for ${event.event_name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: () => {
                        rsvpMutation.mutate(Number(id), {
                            onSuccess: () => {
                                Alert.alert("Success", "You have RSVP'd successfully!");
                                router.back();
                            },
                            onError: (error: any) => {
                                Alert.alert("Error", error?.message || "Failed to RSVP. It might be full or you are already joined.");
                            }
                        });
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: 'Event Details', headerBackTitle: 'Back' }} />

            <View style={styles.heroCard}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{event.event_type}</Text>
                </View>
                <Text style={styles.title}>{event.event_name}</Text>
                {event.creator && <Text style={styles.subtitle}>Host: {event.creator.name} ({event.creator.department})</Text>}
                <View style={styles.modeContainer}>
                    <MaterialCommunityIcons name={event.mode === 'Virtual' ? "laptop" : "human-greeting"} size={16} color="#E9D5FF" />
                    <Text style={styles.modeText}>{event.mode}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>About Event</Text>
                <Text style={styles.descriptionText}>{event.event_description}</Text>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="calendar" size={24} color="#A855F7" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Date & Time</Text>
                        <Text style={styles.infoValue}>{event.event_date} at {event.event_time}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="map-marker" size={24} color="#0A2540" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Location</Text>
                        <Text style={styles.infoValue}>{event.location}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="ticket-confirmation" size={24} color="#F9A03F" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Availability</Text>
                        <Text style={[styles.infoValue, { color: isFull ? '#EF4444' : '#111827' }]}>
                            {isFull ? 'Sold Out' : `${remainingSpots} spot(s) remaining`}
                        </Text>
                        {event.participants && event.participants.length > 0 && (
                            <View style={styles.participantsContainer}>
                                {event.participants.slice(0, 5).map((p, index) => (
                                    <Image
                                        key={p.user.id}
                                        source={{ uri: p.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.name)}&background=random` }}
                                        style={[styles.participantAvatar, { marginLeft: index > 0 ? -12 : 0 }]}
                                    />
                                ))}
                                {event.participants.length > 5 && (
                                    <View style={[styles.participantAvatar, styles.moreParticipantsBadge]}>
                                        <Text style={styles.moreParticipantsText}>+{event.participants.length - 5}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.actionButton, (isFull || rsvpMutation.isPending) && styles.actionButtonDisabled]}
                disabled={isFull || rsvpMutation.isPending}
                onPress={handleRSVP}
                activeOpacity={0.8}
            >
                {rsvpMutation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <>
                        <MaterialCommunityIcons
                            name={isFull ? "close-circle" : "check-decagram"}
                            size={20}
                            color="#FFFFFF"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={styles.actionButtonText}>
                            {isFull ? 'Event Full' : 'RSVP Now'}
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
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    heroCard: {
        backgroundColor: '#7E22CE', // Deep purple for events hero
        borderRadius: 16,
        padding: 32,
        marginBottom: 24,
        alignItems: 'center',
    },
    typeBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#E9D5FF',
        marginBottom: 16,
    },
    modeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    modeText: {
        color: '#FFFFFF',
        marginLeft: 6,
        fontWeight: '600',
        fontSize: 13,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3E8FF', // Light purple
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    actionButton: {
        backgroundColor: '#9333EA', // Primary purple
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#9333EA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonDisabled: {
        backgroundColor: '#D1D5DB',
        shadowOpacity: 0,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
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
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
    },
    moreParticipantsBadge: {
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -12,
    },
    moreParticipantsText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6B7280',
    }
});
