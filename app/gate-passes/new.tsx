import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCreateGatePass } from '../../src/hooks/useGatePasses';

const REF_TYPES = ['Purchase Order', 'Invoice', 'Other'];

interface Item {
  description: string;
  quantity: string;
  unit: string;
}

export default function NewGatePassScreen() {
  const router = useRouter();
  const createMutation = useCreateGatePass();

  const [form, setForm] = useState({
    reference_type: 'Purchase Order',
    reference_value: '',
    supplier_business_name: '',
    supplier_contact: '',
    items: [{ description: '', quantity: '1', unit: 'pcs' }] as Item[],
  });

  const addItem = () => {
    setForm(f => ({
      ...f,
      items: [...f.items, { description: '', quantity: '1', unit: 'pcs' }],
    }));
  };

  const removeItem = (idx: number) => {
    setForm(f => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }));
  };

  const updateItem = (idx: number, field: keyof Item, value: string) => {
    setForm(f => ({
      ...f,
      items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  const handleSubmit = async () => {
    if (!form.reference_value || form.items.some(i => !i.description)) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    try {
      await createMutation.mutateAsync({
        reference_type: form.reference_type as 'PO Number' | 'Reference Number',
        reference_value: form.reference_value,
        supplier_business_name: form.supplier_business_name,
        supplier_contact: form.supplier_contact,
        supplier_contact_person: '',
        total_packages: form.items.length,
        items: form.items.map(i => ({
          item_description: i.description,
          quantity: parseFloat(i.quantity) || 1,
          unit: i.unit,
          reason: '',
          estimated_return_date: new Date().toISOString().split('T')[0],
        })),
      });
      Alert.alert('Success', 'Gate pass created', [
        { text: 'OK', onPress: () => router.replace('/gate-passes') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>New Gate Pass</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Reference Type</Text>
        <View style={styles.options}>
          {REF_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.option, form.reference_type === t && styles.optionActive]}
              onPress={() => setForm(f => ({ ...f, reference_type: t }))}
            >
              <Text style={form.reference_type === t ? styles.optionTextActive : styles.optionText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Reference Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., PO-2024-001"
          value={form.reference_value}
          onChangeText={v => setForm(f => ({ ...f, reference_value: v }))}
        />

        <Text style={styles.label}>Supplier (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Business name"
          value={form.supplier_business_name}
          onChangeText={v => setForm(f => ({ ...f, supplier_business_name: v }))}
        />
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          placeholder="Contact number"
          value={form.supplier_contact}
          onChangeText={v => setForm(f => ({ ...f, supplier_contact: v }))}
          keyboardType="phone-pad"
        />

        <View style={styles.itemsHeader}>
          <Text style={styles.label}>Items *</Text>
          <TouchableOpacity onPress={addItem}>
            <Text style={styles.addItem}>+ Add Item</Text>
          </TouchableOpacity>
        </View>

        {form.items.map((item, idx) => (
          <View key={idx} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemNum}>Item #{idx + 1}</Text>
              {form.items.length > 1 && (
                <TouchableOpacity onPress={() => removeItem(idx)}>
                  <Text style={styles.remove}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={item.description}
              onChangeText={v => updateItem(idx, 'description', v)}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Qty"
                value={item.quantity}
                onChangeText={v => updateItem(idx, 'quantity', v)}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Unit"
                value={item.unit}
                onChangeText={v => updateItem(idx, 'unit', v)}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submit, createMutation.isPending && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          <Text style={styles.submitText}>Create Gate Pass</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: '700', color: '#0a2540' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, fontSize: 16 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  optionActive: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  optionText: { fontSize: 14, color: '#374151' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addItem: { color: '#0066CC', fontWeight: '600' },
  itemCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemNum: { fontWeight: '600', color: '#374151' },
  remove: { color: '#ef4444' },
  row: { flexDirection: 'row', marginTop: 8 },
  submit: { backgroundColor: '#0066CC', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitDisabled: { backgroundColor: '#93c5fd' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
