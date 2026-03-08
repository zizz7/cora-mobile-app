import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { useSubmitLeave } from '../../src/hooks/useLeaves';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function NewLeaveScreen() {
    const router = useRouter();
    const submitMutation = useSubmitLeave();

    const [leaveType, setLeaveType] = useState('Annual Leave');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const leaveTypes = ['Annual Leave', 'Sick Leave', 'Compensatory Off', 'Unpaid Leave'];

    const handleSubmit = () => {
        if (!startDate || !endDate) {
            Alert.alert('Validation Error', 'Please provide start and end dates in YYYY-MM-DD format.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const dayCount = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        submitMutation.mutate(
            { leave_type: leaveType, from_date: startDate, to_date: endDate, leave_reason: reason, day: dayCount },
            {
                onSuccess: () => {
                    Alert.alert('Success', 'Leave request submitted successfully.');
                    router.back();
                },
                onError: (error: any) => {
                    Alert.alert('Error', error?.message || 'Failed to submit leave request.');
                }
            }
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: 'Request Leave', headerShown: true, headerBackTitle: 'Back' }} />

            <TouchableOpacity style={styles.backButtonInline} onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
                <Text style={styles.backButtonText}>Cancel Request</Text>
            </TouchableOpacity>

            <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>Leave Type</Text>
                <View style={styles.chipContainer}>
                    {leaveTypes.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.chip,
                                leaveType === type && styles.chipActive
                            ]}
                            onPress={() => setLeaveType(type)}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.chipText,
                                leaveType === type && styles.chipTextActive
                            ]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Duration</Text>
                <View style={styles.dateRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Start Date</Text>
                        <View style={styles.dateInputContainer}>
                            <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.dateInput}
                                placeholder="YYYY-MM-DD"
                                value={startDate}
                                onChangeText={setStartDate}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>End Date</Text>
                        <View style={styles.dateInputContainer}>
                            <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.dateInput}
                                placeholder="YYYY-MM-DD"
                                value={endDate}
                                onChangeText={setEndDate}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Reason (Options)</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Briefly explain your reason for leave..."
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor="#9CA3AF"
                />

                <TouchableOpacity
                    style={[styles.submitButton, submitMutation.isPending && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitMutation.isPending}
                    activeOpacity={0.8}
                >
                    {submitMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Request</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        padding: 16,
    },
    backButtonInline: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#111827',
        marginLeft: 8,
        fontWeight: '600',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    chip: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        margin: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipActive: {
        backgroundColor: '#E6F7F3',
        borderColor: theme.colors.teal,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    chipTextActive: {
        color: theme.colors.teal,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 24,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        flex: 1,
        marginHorizontal: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    inputIcon: {
        marginRight: 8,
    },
    dateInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
        ...(Platform.select({
            web: { outlineStyle: 'none' },
            default: {}
        }) as any),
    },
    textArea: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#111827',
        minHeight: 120,
        ...(Platform.select({
            web: { outlineStyle: 'none' },
            default: {}
        }) as any),
    },
    submitButton: {
        backgroundColor: theme.colors.teal,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        shadowColor: theme.colors.teal,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    }
});
