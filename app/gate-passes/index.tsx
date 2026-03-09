import { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useGatePasses } from '../../src/hooks/useGatePasses';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved': return '#22c55e';
    case 'Rejected': return '#ef4444';
    case 'Pending': default: return '#f59e0b';
  }
};

export default function GatePassesScreen() {
  const router = useRouter();
  const { data, isLoading } = useGatePasses();

  const passes = data?.pages?.flatMap(page => page.data) || [];

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/gate-passes/${item.gatepass_id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.number}>{item.gatepass_number}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.ref}>{item.reference_type}: {item.reference_value}</Text>
      <Text style={styles.items}>{item.items?.length || 0} items</Text>
    </TouchableOpacity>
  ), [router]);

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.title}>Gate Passes</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/gate-passes/new')}>
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : passes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text>No gate passes yet</Text>
        </View>
      ) : (
        <FlashList
          data={passes}
          keyExtractor={(i) => i.gatepass_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  headerBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0a2540' },
  newBtn: { backgroundColor: '#0066CC', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  newBtnText: { color: '#fff', fontWeight: '600' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  number: { fontSize: 16, fontWeight: '700', color: '#0a2540' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  ref: { fontSize: 13, color: '#6b7280' },
  items: { fontSize: 12, color: '#0066CC', marginTop: 4 },
  loading: { textAlign: 'center', marginTop: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
});
