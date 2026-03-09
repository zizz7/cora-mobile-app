/**
 * Exit Passes List Screen
 */
import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter, Stack } from 'expo-router';
import { useExitPasses } from '../../src/hooks/useExitPasses';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return theme.colors.teal;
    case 'Rejected':
      return theme.colors.danger;
    case 'Pending':
    default:
      return theme.colors.orange;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Approved':
      return '✅';
    case 'Rejected':
      return '❌';
    case 'Pending':
    default:
      return '⏳';
  }
};

export default function ExitPassesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { data: pageData, isLoading, isError, refetch, isRefetching } = useExitPasses();

  const passes = pageData?.pages?.flatMap((page) => page.data) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/exit-passes/${item.id}`)}
      >
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
          <Text style={styles.date}>ID: #{item.id}</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.label}>Departure:</Text>
            <Text style={styles.value}>{item.departure_date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Return:</Text>
            <Text style={styles.value}>{item.return_date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mode:</Text>
            <Text style={styles.value}>{item.mode_of_departure}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.leaveType}>{item.leave_type}</Text>
          {item.departure_status && (
            <Text style={styles.checkStatus}>{item.departure_status}</Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [router]
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, theme.spacing.md) }]}>
        <Text style={styles.title}>Exit Passes</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => router.push('/exit-passes/new')}
        >
          <Text style={styles.newButtonText}>+ New Request</Text>
        </TouchableOpacity>
      </View>

      {passes.length === 0 && !isLoading ? (
        <View style={styles.empty}>
          <Ionicons name="airplane" size={48} color={theme.colors.textTertiary} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No exit passes yet</Text>
          <Text style={styles.emptySubtext}>Create your first request</Text>
        </View>
      ) : (
        <FlashList
          data={passes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPage,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.headingL,
    color: theme.colors.textPrimary,
  },
  newButton: {
    backgroundColor: theme.colors.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  newButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.button,
    fontSize: 14,
  },
  list: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.cardGap,
    ...theme.shadows.level1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: theme.fonts.label,
  },
  date: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.textSecondary,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontFamily: theme.fonts.bodyM,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: 13,
    fontFamily: theme.fonts.label,
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  leaveType: {
    fontSize: 12,
    fontFamily: theme.fonts.label,
    color: theme.colors.teal,
    backgroundColor: `${theme.colors.teal}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  checkStatus: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.textSecondary,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: theme.fonts.headingM,
    color: theme.colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyM,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});
