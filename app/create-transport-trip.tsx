import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../src/theme/theme';
import { useAddTransportTrip } from '../src/hooks/useTransportTrips';

export default function CreateTransportTripScreen() {
    const router = useRouter();
    const addTripMutation = useAddTransportTrip();

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        route: '',
        departure: '',
        arrival: '',
        engine_hours: '',
        fuel_liters: '',
        rpm: '',
        guests: '0',
        staff: '0',
        department: '',
        remarks: '',
    });

    const handleCreate = () => {
        if (!form.route || !form.departure || !form.arrival) {
            Alert.alert('Missing Fields', 'Please fill out the route, departure time, and arrival time.');
            return;
        }

        const payload = {
            ...form,
            engine_hours: parseFloat(form.engine_hours) || 0,
            fuel_liters: parseFloat(form.fuel_liters) || 0,
            rpm: parseInt(form.rpm, 10) || 0,
            guests: parseInt(form.guests, 10) || 0,
            staff: parseInt(form.staff, 10) || 0,
        };

        addTripMutation.mutate(payload, {
            onSuccess: () => {
                Alert.alert('Success', 'Trip logged successfully.');
                router.back();
            },
            onError: (err: any) => {
                Alert.alert('Error', err?.response?.data?.message || 'Failed to log trip.');
            }
        });
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: 'Log Trip',
                    headerStyle: { backgroundColor: theme.colors.bgDarkDeep },
                    headerTintColor: theme.colors.white,
                }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Trip Details</Text>

                    <Text style={styles.label}>Date *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={form.date}
                        onChangeText={(txt) => setForm({ ...form, date: txt })}
                    />

                    <Text style={styles.label}>Route *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Cora Cora - Male"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={form.route}
                        onChangeText={(txt) => setForm({ ...form, route: txt })}
                    />

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Departure *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="HH:MM"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.departure}
                                onChangeText={(txt) => setForm({ ...form, departure: txt })}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Arrival *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="HH:MM"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.arrival}
                                onChangeText={(txt) => setForm({ ...form, arrival: txt })}
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Metrics</Text>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Fuel (Liters)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.0"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.fuel_liters}
                                onChangeText={(txt) => setForm({ ...form, fuel_liters: txt })}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Engine Hrs</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.0"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.engine_hours}
                                onChangeText={(txt) => setForm({ ...form, engine_hours: txt })}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Guests Count</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.guests}
                                onChangeText={(txt) => setForm({ ...form, guests: txt })}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Staff Count</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={form.staff}
                                onChangeText={(txt) => setForm({ ...form, staff: txt })}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Remarks (Optional)</Text>
                    <TextInput
                        style={[styles.input, { minHeight: 80, paddingTop: 12 }]}
                        placeholder="Any special notes"
                        placeholderTextColor={theme.colors.textTertiary}
                        multiline
                        textAlignVertical="top"
                        value={form.remarks}
                        onChangeText={(txt) => setForm({ ...form, remarks: txt })}
                    />

                    <TouchableOpacity
                        style={[styles.submitBtn, addTripMutation.isPending && styles.submitBtnDisabled]}
                        onPress={handleCreate}
                        disabled={addTripMutation.isPending}
                    >
                        {addTripMutation.isPending ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={styles.submitBtnText}>Log Trip</Text>
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
        marginTop: 8,
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
    submitBtn: {
        backgroundColor: theme.colors.bgDarkDeep,
        borderRadius: theme.radius.md,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
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
