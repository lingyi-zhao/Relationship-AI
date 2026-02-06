import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import HealingScreen from '../screens/healing/HealingScreen';
import DatingScreen from '../screens/dating/DatingScreen'; 
import InstructorScreen from '../screens/instructor/InstructorScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

import { RootTabParamList } from '../types';
import { theme } from '../theme';
import { useAppStore } from '../state/store';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
    const { userState, canAccessDating, canAccessCoaching, demoMode } = useAppStore();

    // Determine initial route based on user state
    const getInitialRouteName = (): keyof RootTabParamList => {
        switch (userState) {
            case 'DATING':
                return 'Dating';
            case 'HEALING':
                return 'Healing';
            case 'RELATIONSHIP':
                return 'Instructor';
            default:
                return 'Healing';
        }
    };

    // Check if features are accessible
    const isDatingAccessible = canAccessDating();
    const isCoachingAccessible = canAccessCoaching();

    return (
        <Tab.Navigator
            initialRouteName={getInitialRouteName()} 
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    borderTopWidth: 0,
                    backgroundColor: theme.colors.card,
                    height: 80,
                    paddingBottom: 20,
                    paddingTop: 10,
                    ...theme.shadows.large,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textLighter,
                tabBarLabelStyle: {
                    fontWeight: '700',
                    fontSize: 12,
                    marginTop: 4,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';
                    let isLocked = false;

                    if (route.name === 'Healing') {
                        iconName = focused ? 'leaf' : 'leaf-outline';
                    } else if (route.name === 'Dating') {
                        iconName = focused ? 'heart' : 'heart-outline';
                        isLocked = !isDatingAccessible;
                    } else if (route.name === 'Instructor') {
                        iconName = focused ? 'compass' : 'compass-outline';
                        isLocked = !isCoachingAccessible;
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return (
                        <View style={styles.iconContainer}>
                            <Ionicons 
                                name={iconName} 
                                size={28} 
                                color={isLocked ? '#D0D0D0' : color} 
                            />
                            {isLocked && (
                                <View style={styles.lockBadge}>
                                    <Ionicons name="lock-closed" size={10} color="#FFF" />
                                </View>
                            )}
                            {demoMode && !isLocked && route.name !== 'Healing' && route.name !== 'Settings' && (
                                <View style={styles.demoBadge}>
                                    <Text style={styles.demoText}>✨</Text>
                                </View>
                            )}
                        </View>
                    );
                },
            })}
        >
            {/* Tab 1: Healing (Always accessible) */}
            <Tab.Screen
                name="Healing"
                component={HealingScreen}
                options={{ tabBarLabel: 'Healing' }}
            />
            
            {/* Tab 2: Dating (Requires healing completion) */}
            <Tab.Screen
                name="Dating"
                component={DatingScreen}
                options={{ 
                    tabBarLabel: isDatingAccessible ? 'Dating' : '🔒 Dating',
                }}
            />
            
            {/* Tab 3: AI Coach (Requires matches) */}
            <Tab.Screen
                name="Instructor"
                component={InstructorScreen}
                options={{ 
                    tabBarLabel: isCoachingAccessible ? 'Coach' : '🔒 Coach',
                }}
            />

            {/* Tab 4: Settings (Always accessible) */}
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockBadge: {
        position: 'absolute',
        top: -2,
        right: -8,
        backgroundColor: '#999',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    demoBadge: {
        position: 'absolute',
        top: -4,
        right: -10,
    },
    demoText: {
        fontSize: 10,
    },
});