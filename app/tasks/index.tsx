import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTasks, Task } from '../../src/hooks/useTasks';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme/theme';
import PillHeader, { STATUSBAR_HEIGHT } from '../../src/components/PillHeader';

export default function TasksScreen() {
    const { data: tasks, isLoading, isError } = useTasks();
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.teal} />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load tasks.</Text>
            </View>
        );
    }

    const filteredTasks = tasks?.filter(task => {
        if (filter === 'All') return true;
        return task.status === filter;
    }) || [];

    const renderTask = ({ item }: { item: Task }) => {
        const isCompleted = item.status === 'Completed';

        let priorityColor = '#10B981'; // Low
        let priorityBg = '#D1FAE5';
        if (item.priority === 'High') {
            priorityColor = '#EF4444';
            priorityBg = '#FEE2E2';
        } else if (item.priority === 'Medium') {
            priorityColor = '#F59E0B';
            priorityBg = '#FEF3C7';
        }

        return (
            <View style={[styles.card, isCompleted && styles.cardCompleted]}>
                <View style={styles.cardHeader}>
                    <Text
                        style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}
                        numberOfLines={2}
                    >
                        {item.title}
                    </Text>
                    <TouchableOpacity>
                        <MaterialCommunityIcons
                            name={isCompleted ? "check-circle" : "checkbox-blank-circle-outline"}
                            size={28}
                            color={isCompleted ? "#10B981" : "#D1D5DB"}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                <View style={styles.footerRow}>
                    <View style={styles.dateContainer}>
                        <MaterialCommunityIcons name="calendar-alert" size={16} color={isCompleted ? "#9CA3AF" : "#6B7280"} />
                        <Text style={[styles.dateText, isCompleted && styles.dateTextCompleted]}>
                            Due: {new Date(item.due_date).toLocaleDateString()}
                        </Text>
                    </View>

                    <View style={[styles.priorityBadge, { backgroundColor: isCompleted ? '#F3F4F6' : priorityBg }]}>
                        <Text style={[styles.priorityText, { color: isCompleted ? '#9CA3AF' : priorityColor }]}>
                            {item.priority}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <PillHeader title="My Tasks" />

            <View style={[styles.filterContainer, { marginTop: STATUSBAR_HEIGHT + 40 }]}>
                {['All', 'Pending', 'Completed'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.filterTab, filter === tab && styles.filterTabActive]}
                        onPress={() => setFilter(tab as any)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTask}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="clipboard-check-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No {filter.toLowerCase()} tasks found.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    filterTabActive: {
        borderBottomColor: theme.colors.teal,
    },
    filterText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterTextActive: {
        color: theme.colors.teal,
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B', // Default indicator
    },
    cardCompleted: {
        backgroundColor: '#F9FAFB',
        borderLeftColor: '#10B981',
        shadowOpacity: 0.02,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginRight: 16,
        lineHeight: 22,
    },
    taskTitleCompleted: {
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 16,
        lineHeight: 20,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 6,
        fontWeight: '500',
    },
    dateTextCompleted: {
        color: '#9CA3AF',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    }
});
