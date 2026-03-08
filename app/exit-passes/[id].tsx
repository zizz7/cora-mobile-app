/**
 * Exit Pass Detail Screen
 */
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useExitPass, useApproveExitPass } from '../../src/hooks/useExitPasses';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const getStatusColor = (status: string) => {
  if (status.includes('Approved')) return '#22c55e';
  if (status.includes('Rejected')) return '#ef4444';
  return '#f59e0b';
};

export default function ExitPassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const passId = parseInt(id, 10);

  const { data, isLoading } = useExitPass(passId);
  const approveMutation = useApproveExitPass();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const pass = data?.data;

  if (isLoading || !pass) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  const canApproveHOD =
    user?.role_name === 'HOD' &&
    pass.hod_status === 'Pending' &&
    pass.user.department === user?.department;

  const canApproveHR =
    (user?.role_name === 'HOD' || user?.department === 'Human Resources') &&
    pass.hod_status !== 'Pending' &&
    pass.hr_status === 'Pending';

  const canSecurityCheck =
    user?.role_name === 'Security' && pass.status === 'Approved';

  const handleApprove = async (level: 'hod' | 'hr') => {
    try {
      await approveMutation.mutateAsync({
        id: passId,
        action: 'approve',
        level,
      });
      Alert.alert('Success', `${level.toUpperCase()} approval recorded`);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Approval failed');
    }
  };

  const handleReject = async (level: 'hod' | 'hr') => {
    if (!rejectReason.trim()) {
      Alert.alert('Required', 'Please provide a rejection reason');
      return;
    }
    try {
      await approveMutation.mutateAsync({
        id: passId,
        action: 'reject',
        level,
        reason: rejectReason,
      });
      setShowRejectInput(false);
      Alert.alert('Success', 'Exit pass rejected');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Rejection failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) }]}>
        <Text style={styles.title}>Exit Pass #{pass.id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(pass.status) + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(pass.status) }]}>
            {pass.status}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Employee</Text>
          <Text style={styles.value}>{pass.user.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Department</Text>
          <Text style={styles.value}>{pass.user.department}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Departure</Text>
          <Text style={styles.value}>{pass.departure_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Return</Text>
          <Text style={styles.value}>{pass.return_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{pass.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mode</Text>
          <Text style={styles.value}>{pass.mode_of_departure}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Leave Type</Text>
          <Text style={styles.value}>{pass.leave_type}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Approval Status</Text>
        <View style={styles.row}>
          <Text style={styles.label}>HOD</Text>
          <Text style={styles.value}>{pass.hod_status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>HR</Text>
          <Text style={styles.value}>{pass.hr_status}</Text>
        </View>
        {pass.reject_reason && (
          <View style={styles.rejectBox}>
            <Text style={styles.rejectLabel}>Rejection Reason:</Text>
            <Text style={styles.rejectText}>{pass.reject_reason}</Text>
          </View>
        )}
      </View>

      {/* Approval Actions */}
      {(canApproveHOD || canApproveHR) && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Approval Actions</Text>

          {!showRejectInput ? (
            <>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(canApproveHOD ? 'hod' : 'hr')}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.approveBtnText}>✓ Approve</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => setShowRejectInput(true)}
              >
                <Text style={styles.rejectBtnText}>✕ Reject</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
              />
              <TouchableOpacity
                style={styles.submitRejectBtn}
                onPress={() => handleReject(canApproveHOD ? 'hod' : 'hr')}
                disabled={approveMutation.isPending}
              >
                <Text style={styles.submitRejectText}>Confirm Rejection</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowRejectInput(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {canSecurityCheck && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Security Check</Text>
          <Text style={styles.securityNote}>Staff has approved exit pass</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0a2540' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a2540',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: { fontSize: 14, color: '#6b7280' },
  value: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rejectBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  rejectLabel: { fontSize: 12, fontWeight: '600', color: '#dc2626' },
  rejectText: { fontSize: 13, color: '#7f1d1d', marginTop: 4 },
  approveBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  rejectBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  rejectBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
  },
  submitRejectBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitRejectText: { color: '#fff', fontWeight: '700' },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  securityNote: { color: '#6b7280', fontSize: 14 },
});
