/**
 * City Ledger Tab — Staff spending tracker with premium UI.
 * Chunky progress bar, outlet breakdown, date-grouped transactions.
 */
import { View, Text, StyleSheet, ScrollView, Animated, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TextInput, Switch, Alert, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLedger, useSaveLedgerSettings, LedgerTransaction } from '../../src/hooks/useLedger';
import { useState, useEffect, useCallback } from 'react';
import { theme } from '../../src/theme/theme';

export default function LedgerScreen() {
    const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
    const { data: ledger, isLoading, isError, refetch } = useLedger(selectedMonth);
    const saveMutation = useSaveLedgerSettings();
    const [selectedTx, setSelectedTx] = useState<LedgerTransaction | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [progress] = useState(new Animated.Value(0));
    const [showSettings, setShowSettings] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [settingsLimit, setSettingsLimit] = useState('');
    const [settingsNotify, setSettingsNotify] = useState(false);
    const [settingsEmail, setSettingsEmail] = useState(false);
    const [settingsWhatsapp, setSettingsWhatsapp] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    useEffect(() => {
        if (ledger?.limit_settings) {
            const s = ledger.limit_settings;
            setSettingsLimit(s.limit != null ? String(s.limit) : '');
            setSettingsNotify(!!s.notify_enabled);
            const raw = s.notify_methods;
            const methods = (typeof raw === 'string' && raw.length > 0) ? raw.split(',') : [];
            setSettingsEmail(methods.includes('email'));
            setSettingsWhatsapp(methods.includes('whatsapp'));
        }
    }, [ledger?.limit_settings]);

    useEffect(() => {
        if (ledger && ledger.credit_limit > 0) {
            const pct = (ledger.current_balance / ledger.credit_limit) * 100;
            Animated.spring(progress, {
                toValue: Math.min(pct, 100),
                damping: 15,
                stiffness: 80,
                useNativeDriver: false,
            }).start();
        }
    }, [ledger, progress]);

    const handleSaveSettings = () => {
        const methods: string[] = [];
        if (settingsEmail) methods.push('email');
        if (settingsWhatsapp) methods.push('whatsapp');
        saveMutation.mutate({
            limit: settingsLimit ? Number(settingsLimit) : null,
            notify_enabled: settingsNotify,
            notify_methods: methods.join(','),
        }, {
            onSuccess: () => {
                setShowSettings(false);
                Alert.alert('Saved', 'Settings updated.');
            },
            onError: () => Alert.alert('Error', 'Failed to save settings.'),
        });
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.teal} />
            </View>
        );
    }

    if (isError || !ledger) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={56} color={theme.colors.textTertiary} />
                <Text style={styles.errorText}>Unable to load City Ledger</Text>
                <Text style={styles.errorSubtext}>Pull down to retry</Text>
            </View>
        );
    }

    const percentUsed = ledger.credit_limit > 0
        ? (ledger.current_balance / ledger.credit_limit) * 100
        : 0;
    const remaining = Math.max(ledger.credit_limit - ledger.current_balance, 0);

    // Outlet breakdown
    const outletTotals: Record<string, number> = {};
    (ledger.transactions || []).forEach((t: LedgerTransaction) => {
        const outlet = t.outlet || 'Other';
        outletTotals[outlet] = (outletTotals[outlet] || 0) + Number(t.amount);
    });
    const outletEntries = Object.entries(outletTotals).sort((a, b) => b[1] - a[1]);

    const getOutletIcon = (outlet: string): string => {
        const lower = outlet.toLowerCase();
        if (lower.includes('freedom') || lower.includes('shop')) return 'cart-outline';
        if (lower.includes('bar') || lower.includes('ginger')) return 'wine-outline';
        if (lower.includes('restaurant') || lower.includes('tazaa') || lower.includes('dining')) return 'restaurant-outline';
        if (lower.includes('spa')) return 'leaf-outline';
        return 'receipt-outline';
    };

    const OUTLET_COLORS = [theme.colors.teal, theme.colors.orange, theme.colors.blue, theme.colors.pink, theme.colors.danger, '#06B6D4'];

    // Group transactions by date
    const groupedTransactions: { label: string; items: LedgerTransaction[] }[] = [];
    const txByDate: Record<string, LedgerTransaction[]> = {};
    (ledger.transactions || []).forEach((t: LedgerTransaction) => {
        const d = new Date(t.posted_at);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (!txByDate[key]) txByDate[key] = [];
        txByDate[key].push(t);
    });
    Object.entries(txByDate).forEach(([label, items]) => {
        groupedTransactions.push({ label, items });
    });

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            {/* White pill tab header */}
            <View style={styles.pillHeader}>
                <Text style={styles.pillHeaderText}>City Ledger</Text>
            </View>
            {/* Settings Modal */}
            <Modal visible={showSettings} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ledger Settings</Text>
                            <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.modalCloseBtn}>
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.fieldLabel}>Spending Limit ($)</Text>
                        <TextInput
                            style={styles.input}
                            value={settingsLimit}
                            onChangeText={setSettingsLimit}
                            keyboardType="numeric"
                            placeholder="e.g. 500"
                            placeholderTextColor={theme.colors.textTertiary}
                        />

                        <View style={styles.switchRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.switchLabel}>Notifications</Text>
                                <Text style={styles.switchHint}>Alert when approaching limit</Text>
                            </View>
                            <Switch
                                value={settingsNotify}
                                onValueChange={setSettingsNotify}
                                trackColor={{ false: theme.colors.borderLight, true: theme.colors.transparent.teal20 }}
                                thumbColor={settingsNotify ? theme.colors.teal : '#f4f3f4'}
                                ios_backgroundColor={theme.colors.borderLight}
                            />
                        </View>

                        {settingsNotify && (
                            <View style={styles.methodsContainer}>
                                <Text style={styles.fieldLabel}>Notify via</Text>
                                <TouchableOpacity style={styles.checkRow} onPress={() => setSettingsEmail(!settingsEmail)}>
                                    <Ionicons name={settingsEmail ? 'checkbox' : 'square-outline'} size={24} color={settingsEmail ? theme.colors.teal : theme.colors.textTertiary} />
                                    <Text style={styles.checkLabel}>Email</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.checkRow} onPress={() => setSettingsWhatsapp(!settingsWhatsapp)}>
                                    <Ionicons name={settingsWhatsapp ? 'checkbox' : 'square-outline'} size={24} color={settingsWhatsapp ? theme.colors.teal : theme.colors.textTertiary} />
                                    <Text style={styles.checkLabel}>WhatsApp</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.modalSaveButton, saveMutation.isPending && { opacity: 0.6 }]}
                            onPress={handleSaveSettings}
                            disabled={saveMutation.isPending}
                        >
                            <Text style={styles.modalSaveText}>
                                {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Month Picker Modal */}
            <Modal visible={showMonthPicker} animationType="fade" transparent>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMonthPicker(false)}>
                    <View style={styles.pickerContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Period</Text>
                            <TouchableOpacity onPress={() => setShowMonthPicker(false)} style={styles.modalCloseBtn}>
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {ledger?.available_months?.map((m) => (
                                <TouchableOpacity
                                    key={m.value}
                                    style={[styles.monthOption, ledger.active_month === m.value && styles.monthOptionActive]}
                                    onPress={() => { setSelectedMonth(m.value); setShowMonthPicker(false); }}
                                >
                                    <Text style={[styles.monthOptionText, ledger.active_month === m.value && { color: theme.colors.teal }]}>
                                        {m.label}
                                    </Text>
                                    {ledger.active_month === m.value && (
                                        <Ionicons name="checkmark-circle" size={22} color={theme.colors.teal} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.teal} />}
            >
                {/* Period Banner */}
                <View style={styles.periodBanner}>
                    <TouchableOpacity style={styles.periodPill} onPress={() => setShowMonthPicker(true)} activeOpacity={0.7}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.textPrimary} />
                        <Text style={styles.periodText}>{ledger.billing_cycle}</Text>
                        <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingsChip} onPress={() => setShowSettings(true)}>
                        <Ionicons name="settings-outline" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Ocean Gradient Balance Card */}
                <LinearGradient
                    colors={theme.gradients.ocean as readonly [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.balanceCard}
                >
                    {/* Background Icon */}
                    <MaterialCommunityIcons
                        name="credit-card-outline"
                        size={120}
                        color="rgba(255,255,255,0.1)"
                        style={styles.cardBgIcon}
                    />

                    <View style={styles.balanceTopRow}>
                        <View>
                            <Text style={styles.balanceLabel}>TOTAL USED</Text>
                            <Text style={styles.balanceAmount}>${ledger.current_balance.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.statusPill, {
                            backgroundColor: percentUsed > 90 ? 'rgba(255, 92, 92, 0.2)' : percentUsed > 70 ? 'rgba(255, 161, 107, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                        }]}>
                            <Text style={[styles.statusText, { color: theme.colors.white }]}>
                                {percentUsed.toFixed(0)}%
                            </Text>
                        </View>
                    </View>

                    {/* Chunky Progress Bar */}
                    <View style={styles.progressTrack}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    backgroundColor: percentUsed > 90 ? theme.colors.danger : percentUsed > 70 ? theme.colors.orange : theme.colors.white,
                                    width: progress.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        />
                    </View>

                    <View style={styles.limitsRow}>
                        <View>
                            <Text style={styles.limitLabel}>CREDIT LIMIT</Text>
                            <Text style={styles.limitValue}>${ledger.credit_limit.toFixed(2)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.limitLabel}>REMAINING</Text>
                            <Text style={styles.limitValue}>${remaining.toFixed(2)}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Outlet Breakdown */}
                {outletEntries.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Spending by Outlet</Text>
                        {outletEntries.map(([outlet, total], idx) => {
                            const pct = ledger.current_balance > 0 ? (total / ledger.current_balance) * 100 : 0;
                            return (
                                <View key={outlet} style={styles.outletRow}>
                                    <View style={[styles.outletColorStrip, { backgroundColor: OUTLET_COLORS[idx % OUTLET_COLORS.length] }]} />
                                    <View style={[styles.outletIcon, { backgroundColor: OUTLET_COLORS[idx % OUTLET_COLORS.length] + '15' }]}>
                                        <Ionicons name={getOutletIcon(outlet) as any} size={18} color={OUTLET_COLORS[idx % OUTLET_COLORS.length]} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.outletName} numberOfLines={1}>{outlet}</Text>
                                        <Text style={styles.outletPercent}>{pct.toFixed(0)}% of total</Text>
                                    </View>
                                    <Text style={styles.outletAmount}>${total.toFixed(2)}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Date-Grouped Transactions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    {groupedTransactions.length > 0 ? (
                        groupedTransactions.map((group) => (
                            <View key={group.label}>
                                {/* Date Header */}
                                <View style={styles.dateHeader}>
                                    <Text style={styles.dateHeaderText}>{group.label}</Text>
                                    <View style={styles.dateHeaderLine} />
                                </View>

                                {group.items.map((t: LedgerTransaction, idx: number) => {
                                    const itemDisplay = t.items && t.items.length > 0
                                        ? t.items.join(', ')
                                        : t.outlet || '—';

                                    return (
                                        <TouchableOpacity
                                            key={t.id || idx}
                                            style={styles.txRow}
                                            onPress={() => setSelectedTx(t)}
                                            activeOpacity={0.6}
                                        >
                                            <View style={[styles.txIcon, { backgroundColor: OUTLET_COLORS[outletEntries.findIndex(e => e[0] === t.outlet) % OUTLET_COLORS.length] + '15' }]}>
                                                <Ionicons
                                                    name={getOutletIcon(t.outlet || '') as any}
                                                    size={18}
                                                    color={OUTLET_COLORS[outletEntries.findIndex(e => e[0] === t.outlet) % OUTLET_COLORS.length]}
                                                />
                                            </View>
                                            <View style={styles.txInfo}>
                                                <Text style={styles.txItemName} numberOfLines={1}>{itemDisplay}</Text>
                                                <Text style={styles.txMeta}>
                                                    {t.outlet || '—'} · {formatTime(t.posted_at)}
                                                </Text>
                                            </View>
                                            <View style={styles.txRight}>
                                                <Text style={styles.txAmount}>${Number(t.amount).toFixed(2)}</Text>
                                                <Ionicons name="chevron-forward" size={14} color={theme.colors.textTertiary} />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color={theme.colors.textTertiary} />
                            <Text style={styles.emptyText}>No transactions this period</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ─── Transaction Detail Modal ──────── */}
            <Modal visible={!!selectedTx} animationType="slide" transparent={false} onRequestClose={() => setSelectedTx(null)}>
                <View style={styles.txDetailScreen}>
                    <StatusBar barStyle="light-content" />

                    {/* Gradient Hero Header */}
                    <LinearGradient
                        colors={['#0D2137', '#163A5F', '#1A4A72']}
                        style={styles.txDetailHero}
                    >
                        {/* Nav Bar */}
                        <View style={styles.txDetailNav}>
                            <TouchableOpacity onPress={() => setSelectedTx(null)} style={styles.txDetailBackBtn}>
                                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                            <Text style={styles.txDetailNavTitle}>Transaction</Text>
                            <TouchableOpacity onPress={() => setSelectedTx(null)} style={styles.txDetailCloseBtn}>
                                <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>

                        {selectedTx && (
                            <View style={styles.txDetailHeroContent}>
                                <Text style={styles.txDetailOutletHero}>{selectedTx.outlet || 'Purchase'}</Text>
                                <Text style={styles.txDetailAmountHero}>${Number(selectedTx.amount).toFixed(2)}</Text>
                                <Text style={styles.txDetailDateHero}>
                                    {selectedTx.posted_at
                                        ? new Date(selectedTx.posted_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
                                        + '  ·  ' + formatTime(selectedTx.posted_at)
                                        : '—'}
                                </Text>
                            </View>
                        )}
                    </LinearGradient>

                    {/* Scrollable Content */}
                    {selectedTx && (
                        <ScrollView style={styles.txDetailBody} contentContainerStyle={styles.txDetailBodyContent} showsVerticalScrollIndicator={false}>

                            {/* Detail Card */}
                            <View style={styles.txDetailCard}>
                                <View style={styles.txDetailCardRow}>
                                    <View style={[styles.txDetailIconBadge, { backgroundColor: theme.colors.transparent.teal10 }]}>
                                        <Ionicons name="storefront-outline" size={18} color={theme.colors.teal} />
                                    </View>
                                    <View style={styles.txDetailCardRowText}>
                                        <Text style={styles.txDetailCardLabel}>OUTLET</Text>
                                        <Text style={styles.txDetailCardValue}>{selectedTx.outlet || '—'}</Text>
                                    </View>
                                </View>
                                <View style={styles.txDetailCardDivider} />
                                <View style={styles.txDetailCardRow}>
                                    <View style={[styles.txDetailIconBadge, { backgroundColor: theme.colors.transparent.blue10 }]}>
                                        <Ionicons name="calendar-outline" size={18} color={theme.colors.blue} />
                                    </View>
                                    <View style={styles.txDetailCardRowText}>
                                        <Text style={styles.txDetailCardLabel}>DATE & TIME</Text>
                                        <Text style={styles.txDetailCardValue}>
                                            {selectedTx.posted_at
                                                ? new Date(selectedTx.posted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                                                + '  ·  ' + formatTime(selectedTx.posted_at)
                                                : '—'}
                                        </Text>
                                    </View>
                                </View>
                                {selectedTx.check_num ? (
                                    <>
                                        <View style={styles.txDetailCardDivider} />
                                        <View style={styles.txDetailCardRow}>
                                            <View style={[styles.txDetailIconBadge, { backgroundColor: theme.colors.transparent.pink10 }]}>
                                                <Ionicons name="receipt-outline" size={18} color={theme.colors.orange} />
                                            </View>
                                            <View style={styles.txDetailCardRowText}>
                                                <Text style={styles.txDetailCardLabel}>CHECK #</Text>
                                                <Text style={styles.txDetailCardValue}>{selectedTx.check_num}</Text>
                                            </View>
                                        </View>
                                    </>
                                ) : null}
                            </View>

                            {/* Items List */}
                            {selectedTx.items && selectedTx.items.length > 0 && (
                                <View style={styles.txDetailCard}>
                                    <View style={styles.txItemsHeader}>
                                        <Ionicons name="list-outline" size={18} color={theme.colors.teal} />
                                        <Text style={styles.txItemsTitle}>Items</Text>
                                        <View style={styles.txItemsCountBadge}>
                                            <Text style={styles.txItemsCountText}>{selectedTx.items.length}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.txDetailCardDivider} />
                                    {selectedTx.items.map((item, i) => (
                                        <View key={i} style={styles.txItemRow}>
                                            <View style={styles.txItemDot} />
                                            <Text style={styles.txItemText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Receipt Box */}
                            {selectedTx.receipt_text ? (
                                <View style={styles.txReceiptBox}>
                                    <View style={styles.txReceiptHeader}>
                                        <Ionicons name="document-text-outline" size={16} color={theme.colors.teal} />
                                        <Text style={styles.txReceiptLabel}>RECEIPT</Text>
                                    </View>
                                    <Text style={styles.txReceiptText}>{selectedTx.receipt_text}</Text>
                                </View>
                            ) : null}

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgPage,
    },
    pillHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center',
        paddingTop: STATUSBAR_HEIGHT - 6,
        paddingBottom: 10,
    },
    pillHeaderText: {
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: theme.colors.textPrimary,
        backgroundColor: theme.colors.white,
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
        ...theme.shadows.level1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.bgPage,
    },
    errorText: {
        marginTop: 16,
        fontFamily: theme.fonts.headingM,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    errorSubtext: {
        marginTop: 4,
        fontFamily: theme.fonts.bodyM,
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    scrollContent: {
        padding: 20,
        paddingTop: STATUSBAR_HEIGHT + 40, // space below the pill
    },
    // ─── Period Banner ──────────────────────
    periodBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    periodPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: theme.radius.pill,
        gap: 8,
        ...theme.shadows.level1,
    },
    periodText: {
        fontFamily: theme.fonts.button,
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
    settingsChip: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.level1,
    },
    // ─── Balance Card ───────────────────────
    balanceCard: {
        borderRadius: theme.radius.xl,
        padding: 24,
        marginBottom: 20,
        overflow: 'hidden',
        ...theme.shadows.tealGlow,
    },
    cardBgIcon: {
        position: 'absolute',
        top: -10,
        right: -20,
        transform: [{ rotate: '-15deg' }],
    },
    balanceTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    balanceLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    balanceAmount: {
        fontFamily: theme.fonts.display,
        fontSize: 44,
        lineHeight: 48,
        color: theme.colors.white,
        letterSpacing: -1,
    },
    statusPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
    },
    statusText: {
        fontFamily: theme.fonts.button,
        fontSize: 13,
    },
    progressTrack: {
        height: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 7,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressFill: {
        height: '100%',
        borderRadius: 7,
    },
    limitsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    limitLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1,
        marginBottom: 4,
    },
    limitValue: {
        fontFamily: theme.fonts.headingM,
        fontSize: 15,
        color: theme.colors.white,
    },
    // ─── Sections ───────────────────────────
    section: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: 24,
        marginBottom: 20,
        ...theme.shadows.level1,
    },
    sectionTitle: {
        fontFamily: theme.fonts.headingL,
        fontSize: 18,
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    // ─── Outlet Breakdown ───────────────────
    outletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.borderLight,
    },
    outletColorStrip: {
        width: 4,
        height: 28,
        borderRadius: 2,
        marginRight: 12,
    },
    outletIcon: {
        width: 36,
        height: 36,
        borderRadius: theme.radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    outletName: {
        fontFamily: theme.fonts.headingS,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    outletPercent: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    outletAmount: {
        fontFamily: theme.fonts.amount,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    // ─── Transactions ───────────────────────
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 12,
    },
    dateHeaderText: {
        fontFamily: theme.fonts.headingS,
        fontSize: 12,
        color: theme.colors.teal,
        marginRight: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    dateHeaderLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.borderLight,
    },
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.borderLight,
    },
    txIcon: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    txInfo: {
        flex: 1,
    },
    txItemName: {
        fontFamily: theme.fonts.headingS,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    txMeta: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    txAmount: {
        fontFamily: theme.fonts.amount,
        fontSize: 16,
        color: theme.colors.orange,
    },
    txRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontFamily: theme.fonts.bodyM,
        fontSize: 15,
        color: theme.colors.textSecondary,
    },
    // ─── Modals ─────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.bgPage,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        padding: 24,
        paddingBottom: 40,
    },
    pickerContent: {
        backgroundColor: theme.colors.bgPage,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    modalTitle: {
        fontFamily: theme.fonts.headingL,
        fontSize: 22,
        color: theme.colors.textPrimary,
    },
    modalCloseBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.level1,
    },
    fieldLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 12,
        color: theme.colors.textSecondary,
        letterSpacing: 0.5,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: theme.radius.md,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontFamily: theme.fonts.bodyL,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginBottom: 24,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        marginBottom: 12,
    },
    switchLabel: {
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    switchHint: {
        fontFamily: theme.fonts.bodyS,
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    methodsContainer: {
        marginBottom: 24,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    checkLabel: {
        fontFamily: theme.fonts.bodyL,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    modalSaveButton: {
        backgroundColor: theme.colors.teal,
        borderRadius: theme.radius.md,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    modalSaveText: {
        fontFamily: theme.fonts.button,
        color: theme.colors.white,
        fontSize: 16,
    },
    monthOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: theme.radius.md,
        marginBottom: 8,
        backgroundColor: theme.colors.white,
        ...theme.shadows.level1,
    },
    monthOptionActive: {
        backgroundColor: theme.colors.transparent.teal10,
        borderWidth: 1,
        borderColor: theme.colors.teal,
    },
    monthOptionText: {
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    // ─── Transaction Detail — Full Screen ────────
    txDetailScreen: {
        flex: 1,
        backgroundColor: theme.colors.bgPage,
    },
    txDetailHero: {
        paddingTop: STATUSBAR_HEIGHT + 8,
        paddingBottom: 32,
        paddingHorizontal: 24,
    },
    txDetailNav: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        marginBottom: 24,
    },
    txDetailBackBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    txDetailNavTitle: {
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 0.5,
    },
    txDetailCloseBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    txDetailHeroContent: {
        alignItems: 'center' as const,
    },
    txDetailOutletHero: {
        fontFamily: theme.fonts.headingS,
        fontSize: 15,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
        marginBottom: 8,
    },
    txDetailAmountHero: {
        fontFamily: theme.fonts.display,
        fontSize: 44,
        color: '#FFFFFF',
        letterSpacing: -1,
        marginBottom: 8,
    },
    txDetailDateHero: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    txDetailBody: {
        flex: 1,
    },
    txDetailBodyContent: {
        padding: 20,
        paddingTop: 24,
    },
    txDetailCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: 20,
        marginBottom: 16,
        ...theme.shadows.level1,
    },
    txDetailCardRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 14,
        paddingVertical: 4,
    },
    txDetailIconBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    txDetailCardRowText: {
        flex: 1,
    },
    txDetailCardLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 11,
        color: theme.colors.textTertiary,
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    txDetailCardValue: {
        fontFamily: theme.fonts.headingS,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    txDetailCardDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.borderLight,
        marginVertical: 14,
    },
    txItemsHeader: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 10,
        marginBottom: 4,
    },
    txItemsTitle: {
        flex: 1,
        fontFamily: theme.fonts.headingS,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    txItemsCountBadge: {
        backgroundColor: theme.colors.transparent.teal10,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    txItemsCountText: {
        fontFamily: theme.fonts.headingS,
        fontSize: 13,
        color: theme.colors.teal,
    },
    txItemRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingVertical: 8,
    },
    txItemDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.teal,
        marginRight: 12,
    },
    txItemText: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 14,
        color: theme.colors.textPrimary,
        flex: 1,
    },
    txReceiptBox: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderStyle: 'dashed' as const,
    },
    txReceiptHeader: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 8,
        marginBottom: 14,
    },
    txReceiptLabel: {
        fontFamily: theme.fonts.label,
        fontSize: 11,
        color: theme.colors.teal,
        textTransform: 'uppercase' as const,
        letterSpacing: 1,
    },
    txReceiptText: {
        fontFamily: theme.fonts.bodyM,
        fontSize: 13,
        color: theme.colors.textPrimary,
        lineHeight: 20,
    },
});
