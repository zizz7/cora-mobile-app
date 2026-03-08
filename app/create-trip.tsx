import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../src/theme/theme';
import { useCreateTrip } from '../src/hooks/useTrips';

export default function CreateTripScreen() {
    const router = useRouter();
    const createTripMutation = useCreateTrip();

    const [form, setForm] = useState({
        trip_name: '',
        departure_date: '',
        departure_time: '',
        return_date: '',
        return_time: '',
        departure_location: '',
        max_participants: '',
        visibility: 'Public',
        target_department: '',
    });

    const isPublic = form.visibility === 'Public';

    const handleCreate = () => {
        // Basic validation
        if (!form.trip_name || !form.departure_date || !form.departure_time || !form.return_date || !form.return_time || !form.departure_location || !form.max_participants) {
            Alert.alert('Missing Fields', 'Please fill out all required fields.');
            return;
        }

        const payload = {
            ...form,
            max_participants: Number.parseInt(form.max_participants, 10),
            target_department: isPublic ? null : form.target_department,
        };

        createTripMutation.mutate(payload, {
            onSuccess: () => {
                Alert.alert('Success', 'Trip created successfully.');
                router.back();
            },
            onError: (err: any) => {
                Alert.alert('Error', err?.response?.data?.message || 'Failed to create trip.');
            }
        });
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: 'Create Trip',
                    headerStyle: { backgroundColor: theme.colors.bgDarkDeep },
                    headerTintColor: theme.colors.white,
                }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Trip Details</Text>

                    <Text style={styles.label}>Trip Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Shopping Trip to Male"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={form.trip_name}
                        onChangeText={(txt) => setForm({ ...form, trip_name: txt })}
                    />

                    <Text style={styles.label}>Departure Location *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Cora Cora Staff Jetty"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={form.departure_location}
                        onChangeText={(txt) => setForm({ ...form, departure_location: txt })}
                    />

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Departure Date *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.departure_date}
                                onChangeText={(txt) => setForm({ ...form, departure_date: txt })}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Time *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="HH:MM"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.departure_time}
                                onChangeText={(txt) => setForm({ ...form, departure_time: txt })}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Return Date *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.return_date}
                                onChangeText={(txt) => setForm({ ...form, return_date: txt })}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Time *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="HH:MM"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.return_time}
                                onChangeText={(txt) => setForm({ ...form, return_time: txt })}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Max Participants *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 15"
                        placeholderTextColor={theme.colors.textTertiary}
                        keyboardType="numeric"
                        value={form.max_participants}
                        onChangeText={(txt) => setForm({ ...form, max_participants: txt })}
                    />

                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Public Trip?</Text>
                        <Switch
                            value={isPublic}
                            onValueChange={(val) => setForm({ ...form, visibility: val ? 'Public' : 'Private' })}
                            trackColor={{ false: theme.colors.borderMid, true: theme.colors.teal }}
                            thumbColor={theme.colors.white}
                        />
                    </View>
                    <Text style={styles.helpText}>
                        {isPublic ? 'Any staff can see and join this trip.' : 'Only invited members or specific department can join.'}
                    </Text>

                    {!isPublic && (
                        <>
                            <Text style={[styles.label, { marginTop: 12 }]}>Target Department (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Human Resources"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.target_department}
                                onChangeText={(txt) => setForm({ ...form, target_department: txt })}
                            />
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.submitBtn, createTripMutation.isPending && styles.submitBtnDisabled]}
                        onPress={handleCreate}
                        disabled={createTripMutation.isPending}
                    >
                        {createTripMutation.isPending ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={styles.submitBtnText}>Create Trip</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgPage,
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        backgroundColor: theme.colors.surfaceCard,
        borderRadius: theme.radius.md,
        padding: 24,
        ...theme.shadows.level2,
    },
    sectionTitle: {
        fontFamily: theme.fonts.headingM,
        fontSize: 18,
        color: theme.colors.bgDarkDeep,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    col: {
        flex: 1,
    },
    label: {
        fontFamily: theme.fonts.label,
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.borderMid,
        borderRadius: theme.radius.sm,
        padding: 12,
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    helpText: {
        fontFamily: theme.fonts.caption,
        fontSize: 12,
        color: theme.colors.textTertiary,
        marginTop: 4,
    },
    submitBtn: {
        backgroundColor: theme.colors.bgDarkDeep,
        borderRadius: theme.radius.md,
        padding: 16,
        alignItems: 'center',
        marginTop: 32,
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        color: theme.colors.white,
    },
});
