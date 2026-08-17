import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CharacterScreen from '../screens/CharacterScreen';
import HomeScreen from '../screens/HomeScreen';
import NotesScreen from '../screens/NotesScreen';
import RemindersScreen from '../screens/RemindersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Notes: 'document-text',
  Reminders: 'alarm',
  Character: 'person',
  Settings: 'settings',
};

const TAB_TITLES: Record<keyof TabParamList, string> = {
  Home: 'Главная',
  Notes: 'Заметки',
  Reminders: 'Задачи',
  Character: 'Персонаж',
  Settings: 'Настройки',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.tabBar },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: TAB_TITLES.Home }}
      />
      <Tab.Screen
        name="Notes"
        component={NotesScreen}
        options={{ title: TAB_TITLES.Notes }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{ title: TAB_TITLES.Reminders }}
      />
      <Tab.Screen
        name="Character"
        component={CharacterScreen}
        options={{ title: TAB_TITLES.Character }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: TAB_TITLES.Settings }}
      />
    </Tab.Navigator>
  );
}
