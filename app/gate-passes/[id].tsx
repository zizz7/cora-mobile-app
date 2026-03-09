import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGatePass } from '../../src/hooks/useGatePasses';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved': return '#22c55e';
    case 'Rejected': return '#ef4444';
    default: return '#f59e0b';
  }
};

export default function GatePassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useGatePass(Number(id));
  
  const pass = data?.data;

  if (!pass) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.number}>{pass.gatepass_number}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(pass.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(pass.status) }]}>{pass.status}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{pass.gatepass_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Reference</Text>
          <Text style={styles.value}>{pass.reference_type}: {pass.reference_value}</Text>
        </View>
        {pass.supplier_business_name && (
          <View style={styles.row}>
            <Text style={styles.label}>Supplier</Text>
            <Text style={styles.value}>{pass.supplier_business_name}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items ({pass.items?.length || 0})</Text>
        {pass.items?.map((item: any, idx: number) => (
          <View key={idx} style={styles.item}>
            <Text style={styles.itemNum}>#{idx + 1}</Text>
            <Text style={styles.itemDesc}>{item.description}</Text>
            <Text style={styles.itemQty}>{item.quantity} {item.unit}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>QR Code</Text>
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrIcon}>📱</Text>
          <Text style={styles.qrText}>Scan at security gate</Text>
          <Text style={styles.qrSubtext}>Token: {pass.gatepass_number}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 20, backgroundColor: '#fff', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  number: { fontSize: 20, fontWeight: '700', color: '#0a2540' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0a2540', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 14, color: '#6b7280' },
  value: { fontSize: 14, fontWeight: '600', color: '#111827' },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemNum: { fontSize: 12, color: '#6b7280' },
  itemDesc: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 2 },
  itemQty: { fontSize: 13, color: '#0066CC', marginTop: 2 },
  qrPlaceholder: { alignItems: 'center', padding: 30, backgroundColor: '#f9fafb', borderRadius: 10 },
  qrIcon: { fontSize: 48, marginBottom: 8 },
  qrText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  qrSubtext: { fontSize: 12, color: '#6b7280', marginTop: 4 },
});
