import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useRequestOtp, useResetPassword } from '../src/hooks/useForgotPassword';

export default function ForgotPasswordScreen() {
    const [step, setStep] = useState<1 | 2>(1);
    const [employeeId, setEmployeeId] = useState('');
    const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');

    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const requestOtpMutation = useRequestOtp();
    const resetPasswordMutation = useResetPassword();
    const { authenticateWithToken } = useAuth();

    const handleRequestOtp = async () => {
        if (!employeeId.trim()) {
            Alert.alert('Validation', 'Please enter your Employee ID');
            return;
        }

        try {
            const response = await requestOtpMutation.mutateAsync({
                employee_id: employeeId.trim(),
                channel
            });

            Alert.alert('OTP Sent', response.message || 'Please check your messages for the OTP code.');
            setStep(2);
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to request OTP. Please try again.');
        }
    };

    const handleResetPassword = async () => {
        if (!otp.trim() || otp.length !== 6) {
            Alert.alert('Validation', 'Please enter a valid 6-digit OTP code');
            return;
        }
        if (!password || password.length < 6) {
            Alert.alert('Validation', 'Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Validation', 'Passwords do not match');
            return;
        }

        try {
            const response = await resetPasswordMutation.mutateAsync({
                employee_id: employeeId.trim(),
                otp: otp.trim(),
                password,
                password_confirmation: confirmPassword
            });

            Alert.alert('Success', 'Your password has been reset successfully!');

            // Auto login and navigate to tabs
            await authenticateWithToken(response.token, response.user);
            router.replace('/(tabs)');

        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Invalid or expired OTP. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#0A2540" />
                </TouchableOpacity>

                <View style={styles.content}>
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>
                        {step === 1 ? 'Enter your Employee ID to receive a password reset code.' : 'Enter the 6-digit code sent to you to reset your password.'}
                    </Text>

                    {step === 1 && (
                        <View style={styles.formContainer}>
                            <Text style={styles.inputLabel}>Employee ID</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your Employee ID"
                                placeholderTextColor="#9CA3AF"
                                value={employeeId}
                                onChangeText={setEmployeeId}
                                autoCapitalize="none"
                                editable={!requestOtpMutation.isPending}
                            />

                            <Text style={styles.inputLabel}>Send code via</Text>
                            <View style={styles.channelContainer}>
                                <TouchableOpacity
                                    style={[styles.channelOption, channel === 'whatsapp' && styles.channelOptionActive]}
                                    onPress={() => setChannel('whatsapp')}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons name="whatsapp" size={20} color={channel === 'whatsapp' ? '#0A2540' : '#6B7280'} />
                                    <Text style={[styles.channelText, channel === 'whatsapp' && styles.channelTextActive]}>WhatsApp</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.channelOption, channel === 'email' && styles.channelOptionActive]}
                                    onPress={() => setChannel('email')}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons name="email-outline" size={20} color={channel === 'email' ? '#0A2540' : '#6B7280'} />
                                    <Text style={[styles.channelText, channel === 'email' && styles.channelTextActive]}>Email</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, requestOtpMutation.isPending && styles.submitButtonDisabled]}
                                onPress={handleRequestOtp}
                                disabled={requestOtpMutation.isPending}
                            >
                                {requestOtpMutation.isPending ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Request OTP</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.formContainer}>
                            <Text style={styles.inputLabel}>OTP Code</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 6-digit OTP"
                                placeholderTextColor="#9CA3AF"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                                editable={!resetPasswordMutation.isPending}
                            />

                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!resetPasswordMutation.isPending}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                                    <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>Confirm Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!resetPasswordMutation.isPending}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                                    <MaterialCommunityIcons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, resetPasswordMutation.isPending && styles.submitButtonDisabled]}
                                onPress={handleResetPassword}
                                disabled={resetPasswordMutation.isPending}
                            >
                                {resetPasswordMutation.isPending ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Reset Password</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resendButton} onPress={() => setStep(1)}>
                                <Text style={styles.resendButtonText}>Didn't receive it? Request again</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    container: {
        flex: 1,
    },
    backButton: {
        padding: 16,
        marginLeft: 8,
        width: 56,
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0A2540',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
        marginBottom: 32,
    },
    formContainer: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        fontSize: 15,
        color: '#111827',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
    },
    channelContainer: {
        flexDirection: 'row',
        marginBottom: 32,
        gap: 12,
    },
    channelOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        height: 48,
        gap: 8,
    },
    channelOptionActive: {
        borderColor: '#0A2540',
        backgroundColor: '#F3F4F6',
    },
    channelText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#6B7280',
    },
    channelTextActive: {
        color: '#0A2540',
        fontWeight: '600',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        height: 52,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        height: '100%',
        fontSize: 15,
        color: '#111827',
    },
    eyeButton: {
        padding: 14,
    },
    submitButton: {
        backgroundColor: '#0A2540',
        borderRadius: 12,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    resendButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    resendButtonText: {
        color: '#0066CC',
        fontSize: 14,
        fontWeight: '500',
    },
});
