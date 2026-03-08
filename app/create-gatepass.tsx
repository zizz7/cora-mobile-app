import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../src/theme/theme';
import { useCreateGatePass } from '../src/hooks/useGatePasses';
import { Ionicons } from '@expo/vector-icons';

export default function CreateGatePassScreen() {
    const router = useRouter();
    const createMutation = useCreateGatePass();

    const [form, setForm] = useState({
        reference_type: 'PO Number' as 'PO Number' | 'Reference Number',
        reference_value: '',
        supplier_business_name: '',
        supplier_contact: '',
        supplier_contact_person: '',
        total_packages: '1',
    });

    const [items, setItems] = useState([
        { item_description: '', quantity: '1', unit: 'pcs', serial_number: '', reason: '', estimated_return_date: '' }
    ]);

    const handleAddItem = () => {
        setItems([...items, { item_description: '', quantity: '1', unit: 'pcs', serial_number: '', reason: '', estimated_return_date: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleUpdateItem = (index: number, field: string, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleCreate = () => {
        if (!form.reference_value || !form.supplier_business_name || !form.supplier_contact || !form.supplier_contact_person) {
            Alert.alert('Missing Fields', 'Please fill in all general details.');
            return;
        }

        const validItems = items.filter(i => i.item_description.trim() !== '');
        if (validItems.length === 0) {
            Alert.alert('Missing Items', 'Please add at least one valid item.');
            return;
        }

        for (const item of validItems) {
            if (!item.reason || !item.estimated_return_date || !item.unit) {
                Alert.alert('Incomplete Items', 'Please provide reason, unit, and estimated return date for all items.');
                return;
            }
        }

        const formattedItems = validItems.map(item => ({
            item_description: item.item_description,
            quantity: parseFloat(item.quantity) || 1,
            unit: item.unit,
            serial_number: item.serial_number || null,
            reason: item.reason,
            estimated_return_date: item.estimated_return_date
        }));

        const payload = {
            ...form,
            total_packages: parseInt(form.total_packages) || 1,
            items: formattedItems as any,
        };

        createMutation.mutate(payload, {
            onSuccess: () => {
                Alert.alert('Success', 'Gate Pass submitted for approval.');
                router.back();
            },
            onError: (err: any) => {
                Alert.alert('Error', err?.response?.data?.message || 'Failed to submit gate pass.');
            }
        });
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: 'Create Gate Pass',
                    headerStyle: { backgroundColor: theme.colors.bgDarkDeep },
                    headerTintColor: theme.colors.white,
                }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>General Details</Text>

                    <Text style={styles.label}>Reference Type *</Text>
                    <View style={styles.pickerRow}>
                        {['PO Number', 'Reference Number'].map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.pillBtn, form.reference_type === type && styles.pillBtnActive]}
                                onPress={() => setForm({ ...form, reference_type: type as any })}
                            >
                                <Text style={[styles.pillBtnText, form.reference_type === type && styles.pillBtnTextActive]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Reference Value *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. PO-2026-001"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={form.reference_value}
                        onChangeText={(txt) => setForm({ ...form, reference_value: txt })}
                    />

                    <Text style={styles.label}>Supplier Business Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Male Supermart"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={form.supplier_business_name}
                        onChangeText={(txt) => setForm({ ...form, supplier_business_name: txt })}
                    />

                    <Text style={styles.label}>Supplier Contact *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. +960 777 1234"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={form.supplier_contact}
                        onChangeText={(txt) => setForm({ ...form, supplier_contact: txt })}
                    />

                    <Text style={styles.label}>Supplier Contact Person *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Ahmed Riyaz"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={form.supplier_contact_person}
                        onChangeText={(txt) => setForm({ ...form, supplier_contact_person: txt })}
                    />

                    <Text style={styles.label}>Total Packages *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="1"
                        keyboardType="numeric"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={form.total_packages}
                        onChangeText={(txt) => setForm({ ...form, total_packages: txt })}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Items</Text>

                    {items.map((item, index) => (
                        <View key={index.toString()} style={styles.itemRow}>
                            <View style={styles.itemRefCounter}>
                                <Text style={styles.counterText}>{index + 1}</Text>
                            </View>
                            <View style={styles.itemInputs}>
                                <Text style={styles.label}>Item Description *</Text>
                                <TextInput
                                    style={styles.itemInputFull}
                                    placeholder="e.g. 24-inch Monitor"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={item.item_description}
                                    onChangeText={(txt) => handleUpdateItem(index, 'item_description', txt)}
                                />
                                <View style={styles.itemSubRow}>
                                    <View style={styles.flexItem}>
                                        <Text style={styles.label}>Quantity *</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="1"
                                            keyboardType="numeric"
                                            value={item.quantity}
                                            onChangeText={(txt) => handleUpdateItem(index, 'quantity', txt)}
                                        />
                                    </View>
                                    <View style={styles.flexItem}>
                                        <Text style={styles.label}>Unit *</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="pcs"
                                            value={item.unit}
                                            onChangeText={(txt) => handleUpdateItem(index, 'unit', txt)}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.label}>Serial Number (Optional)</Text>
                                <TextInput
                                    style={styles.itemInputFull}
                                    placeholder="Enter SN if applicable"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={item.serial_number}
                                    onChangeText={(txt) => handleUpdateItem(index, 'serial_number', txt)}
                                />
                                <Text style={styles.label}>Reason for Gate Pass *</Text>
                                <TextInput
                                    style={styles.itemInputFull}
                                    placeholder="Repair, Return, etc."
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={item.reason}
                                    onChangeText={(txt) => handleUpdateItem(index, 'reason', txt)}
                                />
                                <Text style={styles.label}>Estimated Return Date *</Text>
                                <TextInput
                                    style={styles.itemInputFull}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={item.estimated_return_date}
                                    onChangeText={(txt) => handleUpdateItem(index, 'estimated_return_date', txt)}
                                />
                            </View>
                            {items.length > 1 && (
                                <TouchableOpacity
                                    style={styles.removeBtn}
                                    onPress={() => handleRemoveItem(index)}
                                >
                                    <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
                        <Ionicons name="add" size={20} color={theme.colors.teal} />
                        <Text style={styles.addBtnText}>Add Another Item</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
                    onPress={handleCreate}
                    disabled={createMutation.isPending}
                >
                    {createMutation.isPending ? (
                        <ActivityIndicator color={theme.colors.white} />
                    ) : (
                        <Text style={styles.submitBtnText}>Submit Gate Pass</Text>
                    )}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
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
        marginBottom: 16,
        ...theme.shadows.level1,
    },
    sectionTitle: {
        fontFamily: theme.fonts.headingM,
        fontSize: 18,
        color: theme.colors.bgDarkDeep,
        marginBottom: 20,
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
    pickerRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    pillBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: theme.colors.borderMid,
        backgroundColor: theme.colors.white,
    },
    pillBtnActive: {
        backgroundColor: theme.colors.teal,
        borderColor: theme.colors.teal,
    },
    pillBtnText: {
        fontFamily: theme.fonts.label,
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    pillBtnTextActive: {
        color: theme.colors.white,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
        gap: 12,
    },
    itemRefCounter: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.bgPage,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    counterText: {
        fontFamily: theme.fonts.label,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    itemInputs: {
        flex: 1,
        gap: 12,
    },
    itemInputFull: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.borderMid,
        borderRadius: theme.radius.sm,
        padding: 12,
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    itemSubRow: {
        flexDirection: 'row',
        gap: 12,
    },
    flexItem: {
        flex: 1,
    },
    removeBtn: {
        marginTop: 12,
        padding: 4,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.transparent.teal10,
    },
    addBtnText: {
        fontFamily: theme.fonts.button,
        fontSize: 14,
        color: theme.colors.teal,
        marginLeft: 8,
    },
    submitBtn: {
        backgroundColor: theme.colors.bgDarkDeep,
        borderRadius: theme.radius.md,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
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
