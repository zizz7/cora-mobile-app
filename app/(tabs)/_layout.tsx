/**
 * Tabs Layout — Main authenticated app shell.
 * Clean minimal tab bar with native labels.
 */
import { MaterialTopTabs } from '../../components/MaterialTopTabs';
import { MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/theme/theme';

const DIRECTORY_ALLOWED_ROLES = new Set(['Admin', 'Super Admin', 'HOD', 'Human Resources', 'Manager', 'Assistant Manager', 'Executive Office']);

export default function TabsLayout() {
  const { user } = useAuth();
  const canSeeDirectory = user && DIRECTORY_ALLOWED_ROLES.has(user.role_name);

  return (
    <MaterialTopTabs
      initialRouteName="index"
      tabBarPosition="bottom"
      tabBar={(props) => {
        // Filter out routes that should be hidden (href: null)
        const routes = props.state.routes.filter(route => {
          const { options } = props.descriptors[route.key];
          // @ts-ignore - href exists in Expo Router context
          return (options as any).href !== null;
        });

        const filteredState = {
          ...props.state,
          routes,
          index: Math.min(props.state.index, routes.length - 1),
        };

        return <MaterialTopTabBar {...props} state={filteredState as any} />;
      }}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        sceneStyle: { backgroundColor: theme.colors.bgPage },
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.borderLight,
          paddingTop: 8,
          paddingBottom: 20, // Manual safe area approximation
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIndicatorStyle: {
          height: 0, // hide top indicator line
        },
        tabBarActiveTintColor: theme.colors.teal,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: theme.fonts.button,
          fontSize: 11,
          textTransform: 'none',
          marginTop: -4,
        },
        tabBarItemStyle: {
          padding: 0,
          minHeight: 48,
        },
        tabBarShowLabel: true,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="ledger"
        options={{
          title: 'Ledger',
          tabBarLabel: 'Ledger',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={22} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="directory"
        options={{
          title: 'Directory',
          tabBarLabel: 'Directory',
          href: canSeeDirectory ? '/directory' : null,
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="entertainment"
        options={{
          title: 'Fun',
          tabBarLabel: 'Fun',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Ionicons name={focused ? 'happy' : 'happy-outline'} size={22} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="menu"
        options={{
          title: 'More',
          tabBarLabel: 'More',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* Hidden tabs — accessible via routing only */}
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          href: null,
          title: 'My Profile',
          tabBarItemStyle: { display: 'none' }
        }}
      />
      <MaterialTopTabs.Screen
        name="calendar"
        options={{
          href: null,
          title: 'Calendar',
          tabBarItemStyle: { display: 'none' }
        }}
      />
    </MaterialTopTabs>
  );
}
