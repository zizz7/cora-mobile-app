/**
 * New Exit Pass Screen — Create Request Form
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useCreateExitPass } from '../../src/hooks/useExitPasses';
import { theme } from '../../src/theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LEAVE_TYPES = [
  'Annual Leave',
  'Off Day',
  'R&R',
  'Emergency',
  'Business Leave',
  'Other Leave'
] as const;

const MODES = [
  'Seaplane/Domestic',
  'Boat'
] as const;

export default function NewExitPassScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createMutation = useCreateExitPass();

  const [form, setForm] = useState({
    depature_date: '',
    return_date: '',
    location: '',
    mode_of_departure: 'Boat' as typeof MODES[number],
    leave_type: 'Annual Leave' as typeof LEAVE_TYPES[number],
    reason: '',
  });

  const handleSubmit = async () => {
    if (!form.depature_date || !form.return_date || !form.location) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    try {
      await createMutation.mutateAsync(form);
      Alert.alert('Success', 'Exit pass created successfully', [
        { text: 'OK', onPress: () => router.replace('/exit-passes') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create exit pass');
    }
  };

  const formatDateInput = (text: string, field: 'depature_date' | 'return_date') => {
    // Auto-format as DD-MM-YYYY
    const cleaned = text.replace(/\D/g, '').slice(0, 8);
    let formatted = cleaned;
    if (cleaned.length >= 2) formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    if (cleaned.length >= 4) formatted = formatted.slice(0, 5) + '-' + cleaned.slice(4);
    setForm((f) => ({ ...f, [field]: formatted }));
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, theme.spacing.pagePadding) }]}>
        <Text style={styles.title}>New Exit Pass</Text>
        <Text style={styles.subtitle}>Request permission to leave the island</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Departure Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="DD-MM-YYYY"
          value={form.depature_date}
          onChangeText={(text) => formatDateInput(text, 'depature_date')}
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={styles.label}>Return Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="DD-MM-YYYY"
          value={form.return_date}
          onChangeText={(text) => formatDateInput(text, 'return_date')}
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={styles.label}>Destination *</Text>
        <TextInput
          style={styles.input}
          placeholder="Where are you going?"
          value={form.location}
          onChangeText={(location) => setForm((f) => ({ ...f, location }))}
        />

        <Text style={styles.label}>Mode of Departure</Text>
        <View style={styles.optionsRow}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.optionBtn,
                form.mode_of_departure === mode && styles.optionBtnActive,
              ]}
              onPress={() => setForm((f) => ({ ...f, mode_of_departure: mode }))}
            >
              <Text
                style={[
                  styles.optionText,
                  form.mode_of_departure === mode && styles.optionTextActive,
                ]}
              >
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Leave Type</Text>
        <View style={styles.optionsRow}>
          {LEAVE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionBtn,
                form.leave_type === type && styles.optionBtnActive,
              ]}
              onPress={() => setForm((f) => ({ ...f, leave_type: type }))}
            >
              <Text
                style={[
                  styles.optionText,
                  form.leave_type === type && styles.optionTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Reason (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add any additional details..."
          value={form.reason}
          onChangeText={(reason) => setForm((f) => ({ ...f, reason }))}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>Submit Request</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          disabled={createMutation.isPending}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPage,
  },
  header: {
    padding: theme.spacing.pagePadding,
    backgroundColor: theme.colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.headingXl,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyM,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: theme.fonts.label,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.xs,
    padding: 14,
    fontSize: 16,
    fontFamily: theme.fonts.bodyL,
    color: theme.colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionBtnActive: {
    backgroundColor: theme.colors.teal,
    borderColor: theme.colors.teal,
  },
  optionText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyM,
    color: theme.colors.textPrimary,
  },
  optionTextActive: {
    color: theme.colors.white,
    fontFamily: theme.fonts.label,
  },
  submitBtn: {
    backgroundColor: theme.colors.teal,
    borderRadius: theme.radius.xs,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  submitBtnDisabled: {
    backgroundColor: `${theme.colors.teal}80`,
  },
  submitBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.fonts.button,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontFamily: theme.fonts.label,
  },
});
