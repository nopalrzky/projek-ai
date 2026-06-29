import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import BookFieldScreen from '../screens/BookFieldScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import CustomerMembershipScreen from '../screens/CustomerMembershipScreen';
import AdminScreen from '../screens/AdminScreen';
import OwnerScreen from '../screens/OwnerScreen';
import SuperAdminScreen from '../screens/SuperAdminScreen';

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.bg,
    card: Colors.bgCard,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.primary,
  },
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Bookings: { focused: 'calendar', unfocused: 'calendar-outline' },
  Membership: { focused: 'ribbon', unfocused: 'ribbon-outline' },
  Verify: { focused: 'key', unfocused: 'key-outline' },
  History: { focused: 'time', unfocused: 'time-outline' },
  Dashboard: { focused: 'stats-chart', unfocused: 'stats-chart-outline' },
  Fields: { focused: 'football', unfocused: 'football-outline' },
  Revenue: { focused: 'cash', unfocused: 'cash-outline' },
  'Owner Members': { focused: 'people', unfocused: 'people-outline' },
};

function TabIcon({ route, focused, color, size }) {
  const icons = tabIcons[route.name] || { focused: 'ellipse', unfocused: 'ellipse-outline' };
  return <Ionicons name={focused ? icons.focused : icons.unfocused} size={size} color={color} />;
}

// ─── Customer Tab Navigator ────────────────────────────

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: (p) => <TabIcon route={route} {...p} />,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.bgCard, borderTopColor: Colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
      <Tab.Screen name="Membership" component={CustomerMembershipScreen} />
    </Tab.Navigator>
  );
}

// ─── Admin (Kasir) Tab Navigator ──────────────────────

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: (p) => <TabIcon route={route} {...p} />,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.bgCard, borderTopColor: Colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Verify">
        {() => <AdminScreen initialTab="verify" />}
      </Tab.Screen>
      <Tab.Screen name="History">
        {() => <AdminScreen initialTab="history" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ─── Owner Tab Navigator ──────────────────────────────

function OwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: (p) => <TabIcon route={route} {...p} />,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.bgCard, borderTopColor: Colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={OwnerScreen} />
      <Tab.Screen name="Bookings" component={OwnerScreen} />
      <Tab.Screen name="Revenue" component={OwnerScreen} />
      <Tab.Screen name="Members" component={OwnerScreen} />
    </Tab.Navigator>
  );
}

// ─── Role-based navigator ──────────────────────────────

function RoleNavigator() {
  const { role } = useAuth();

  if (role === 'customer') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CustomerMain" component={CustomerTabs} />
        <Stack.Screen name="BookField" component={BookFieldScreen} />
      </Stack.Navigator>
    );
  }

  if (role === 'admin' || role === 'kasir') {
    return <AdminTabs />;
  }

  if (role === 'owner') {
    return <OwnerTabs />;
  }

  if (role === 'superadmin') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SuperAdminMain" component={SuperAdminScreen} />
      </Stack.Navigator>
    );
  }

  // fallback
  return <CustomerTabs />;
}

// ─── Root Navigator ────────────────────────────────────

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={RoleNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
