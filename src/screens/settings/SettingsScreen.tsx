import React, { useState, useMemo } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, TextInput, FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import MyCard from '../../components/MyCard'; 
import { useAppStore } from '../../state/store';
import { theme } from '../../theme';
import { UserState } from '../../types';

// --- CONSTANTS (Reused for consistent experience) ---
const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
    "Wisconsin", "Wyoming"
];

const MOCK_CITIES = [
    "New York City", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", 
    "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", 
    "San Francisco", "Columbus", "Fort Worth", "Indianapolis", "Charlotte", "Seattle", 
    "Denver", "Washington", "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", 
    "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee"
];

// --- HELPER: Searchable Modal (Same as Onboarding) ---
const SearchableSelect = ({ 
    visible, 
    data, 
    onSelect, 
    onClose, 
    title, 
    placeholder 
}: { 
    visible: boolean; 
    data: string[]; 
    onSelect: (item: string) => void; 
    onClose: () => void; 
    title: string;
    placeholder: string;
}) => {
    const [search, setSearch] = useState('');
    
    const filteredData = useMemo(() => {
        if (!search) return data;
        return data.filter(item => item.toLowerCase().includes(search.toLowerCase()));
    }, [data, search]);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
                <TextInput 
                    style={styles.modalSearch} 
                    placeholder={placeholder}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus
                />
                <FlatList 
                    data={filteredData}
                    keyExtractor={(item) => item}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.modalItem} 
                            onPress={() => { onSelect(item); setSearch(''); }}
                        >
                            <Text style={styles.modalItemText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
};

export default function SettingsScreen() {
    const { 
        user, userState, setUserState, resetOnboarding, setUser,
        demoMode, toggleDemoMode, resetAllProgress,
        canAccessDating, canAccessCoaching, getUnlockProgress,
        completeHealingPhase, unlockDating, unlockRelationship,
        getDatingCheckInCount, matches
    } = useAppStore();
    
    // UI State
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);

    // Location Editing State
    const [tempState, setTempState] = useState('');
    const [tempCity, setTempCity] = useState('');
    const [showStatePicker, setShowStatePicker] = useState(false);
    const [showCityPicker, setShowCityPicker] = useState(false);

    // Get current location display
    // @ts-ignore - extendedProfile might not be typed yet
    const displayLocation = user?.extendedProfile?.location || user?.location || 'Unknown Location';

    const handleStatusChange = (newState: UserState) => {
        setUserState(newState);
        setStatusModalVisible(false);
        Alert.alert("Status Updated", `Switched to ${newState} mode.`);
    };

    const handleSaveLocation = () => {
        if (!tempState || !tempCity) {
            Alert.alert("Incomplete", "Please select both State and City.");
            return;
        }
        
        // Update user store
        setUser({
            ...user!, // Keep existing data
            // @ts-ignore
            extendedProfile: {
                ...user?.extendedProfile,
                location: `${tempCity}, ${tempState}`
            }
        });

        setLocationModalVisible(false);
        // Reset temp state
        setTempState('');
        setTempCity('');
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.headerTitle}>Profile & Settings</Text>

                {/* 1. User Profile Card */}
                <MyCard style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                            <View style={[styles.badge, { backgroundColor: getStatusColor(userState) + '20' }]}>
                                <Text style={[styles.badgeText, { color: getStatusColor(userState) }]}>
                                    {userState}
                                </Text>
                            </View>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-sharp" size={12} color={theme.colors.textLight} />
                                <Text style={styles.userMeta}>{displayLocation}</Text>
                            </View>
                        </View>
                    </View>
                </MyCard>

                {/* 2. Account Actions */}
                <Text style={styles.sectionTitle}>Account</Text>
                
                <MyCard style={styles.menuCard}>
                    {/* Update Status */}
                    <TouchableOpacity style={styles.menuItem} onPress={() => setStatusModalVisible(true)}>
                        <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="swap-horizontal" size={20} color={theme.colors.success} />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Update Status</Text>
                            <Text style={styles.menuSubtitle}>Switch between Healing, Dating, or Relationship</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* NEW: Update Location */}
                    <TouchableOpacity style={styles.menuItem} onPress={() => setLocationModalVisible(true)}>
                        <View style={[styles.iconBox, { backgroundColor: '#E1F5FE' }]}>
                            <Ionicons name="map" size={20} color="#039BE5" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>My Location</Text>
                            <Text style={styles.menuSubtitle}>Change where you are searching</Text>
                        </View>
                        <View style={styles.valueBadge}>
                            <Text style={styles.valueBadgeText} numberOfLines={1}>{displayLocation.split(',')[0]}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="notifications" size={20} color="orange" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Notifications</Text>
                            <Text style={styles.menuSubtitle}>Manage daily tips & reminders</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
                    </TouchableOpacity>
                </MyCard>

                {/* 3. Feature Unlock Progress */}
                <Text style={styles.sectionTitle}>Your Journey</Text>
                <MyCard style={styles.menuCard}>
                    <View style={styles.progressSection}>
                        <View style={styles.progressRow}>
                            <View style={styles.progressInfo}>
                                <Ionicons name="leaf" size={20} color="#4ECDC4" />
                                <Text style={styles.progressLabel}>Healing</Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: '100%', backgroundColor: '#4ECDC4' }]} />
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                        </View>
                        
                        <View style={styles.progressRow}>
                            <View style={styles.progressInfo}>
                                <Ionicons name="heart" size={20} color={canAccessDating() ? '#FF6B6B' : '#CCC'} />
                                <Text style={styles.progressLabel}>Dating</Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: `${getUnlockProgress().dating}%`, backgroundColor: '#FF6B6B' }]} />
                            </View>
                            {canAccessDating() ? (
                                <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                            ) : (
                                <Text style={styles.progressCount}>{getDatingCheckInCount()}/30</Text>
                            )}
                        </View>
                        
                        <View style={styles.progressRow}>
                            <View style={styles.progressInfo}>
                                <Ionicons name="people" size={20} color={canAccessCoaching() ? '#a18cd1' : '#CCC'} />
                                <Text style={styles.progressLabel}>Coaching</Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: `${getUnlockProgress().relationship}%`, backgroundColor: '#a18cd1' }]} />
                            </View>
                            {canAccessCoaching() ? (
                                <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                            ) : (
                                <Text style={styles.progressCount}>{matches.length}/3</Text>
                            )}
                        </View>
                    </View>
                </MyCard>

                {/* 4. Demo Controls (For Testers) */}
                <Text style={styles.sectionTitle}>🧪 Demo Controls</Text>
                <MyCard style={[styles.menuCard, demoMode && { borderWidth: 2, borderColor: '#FFD700' }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={toggleDemoMode}>
                        <View style={[styles.iconBox, { backgroundColor: demoMode ? '#FFF9C4' : '#F5F5F5' }]}>
                            <Ionicons name={demoMode ? "flash" : "flash-outline"} size={20} color={demoMode ? '#FFD700' : '#999'} />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Demo Mode</Text>
                            <Text style={styles.menuSubtitle}>{demoMode ? '✨ All features unlocked!' : 'Unlock all features for testing'}</Text>
                        </View>
                        <View style={[styles.toggleSwitch, demoMode && styles.toggleSwitchOn]}>
                            <View style={[styles.toggleKnob, demoMode && styles.toggleKnobOn]} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <View style={styles.quickUnlockRow}>
                        <TouchableOpacity 
                            style={[styles.quickUnlockBtn, { backgroundColor: '#4ECDC420' }]}
                            onPress={completeHealingPhase}
                        >
                            <Ionicons name="leaf" size={16} color="#4ECDC4" />
                            <Text style={[styles.quickUnlockText, { color: '#4ECDC4' }]}>Complete Healing</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.quickUnlockBtn, { backgroundColor: '#FF6B6B20' }]}
                            onPress={unlockDating}
                        >
                            <Ionicons name="heart" size={16} color="#FF6B6B" />
                            <Text style={[styles.quickUnlockText, { color: '#FF6B6B' }]}>Unlock Dating</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.quickUnlockBtn, { backgroundColor: '#a18cd120' }]}
                            onPress={unlockRelationship}
                        >
                            <Ionicons name="people" size={16} color="#a18cd1" />
                            <Text style={[styles.quickUnlockText, { color: '#a18cd1' }]}>Unlock Coach</Text>
                        </TouchableOpacity>
                    </View>
                </MyCard>

                {/* 5. Danger Zone */}
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <MyCard style={styles.menuCard}>
                     <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => {
                            Alert.alert(
                                "Reset Everything?",
                                "This will wipe all data, progress, and unlock status.",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Reset Everything", style: 'destructive', onPress: resetAllProgress }
                                ]
                            );
                        }}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
                            <Ionicons name="trash" size={20} color={theme.colors.error} />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={[styles.menuTitle, { color: theme.colors.error }]}>Reset All Progress</Text>
                            <Text style={styles.menuSubtitle}>Clear all data and start fresh</Text>
                        </View>
                    </TouchableOpacity>
                </MyCard>

                <Text style={styles.versionText}>RelationshipAI v2.0.0 (Demo)</Text>
            </ScrollView>

            {/* --- MODAL 1: STATUS CHANGE --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={statusModalVisible}
                onRequestClose={() => setStatusModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setStatusModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Where are you at?</Text>
                        <Text style={styles.modalSubtitle}>Select your current situation to adapt the AI.</Text>

                        <TouchableOpacity style={styles.optionButton} onPress={() => handleStatusChange('HEALING')}>
                            <View style={[styles.optionIcon, { backgroundColor: '#FF9A9E20' }]}>
                                <Ionicons name="bandage" size={24} color="#FF9A9E" />
                            </View>
                            <Text style={styles.optionText}>Need healing?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={() => handleStatusChange('DATING')}>
                            <View style={[styles.optionIcon, { backgroundColor: '#FF6B6B20' }]}>
                                <Ionicons name="flame" size={24} color="#FF6B6B" />
                            </View>
                            <Text style={styles.optionText}>Trying to see someone?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={() => handleStatusChange('RELATIONSHIP')}>
                            <View style={[styles.optionIcon, { backgroundColor: '#a18cd120' }]}>
                                <Ionicons name="heart" size={24} color="#a18cd1" />
                            </View>
                            <Text style={styles.optionText}>Got a trustworthy partner?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setStatusModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* --- MODAL 2: LOCATION EDIT (NEW) --- */}
            <Modal
                animationType="slide"
                presentationStyle="pageSheet"
                visible={locationModalVisible}
                onRequestClose={() => setLocationModalVisible(false)}
            >
                <View style={styles.sheetContainer}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Change Location</Text>
                        <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.sheetContent}>
                        <Text style={styles.sheetSubtitle}>
                            Update your city to get relevant date spots and activity recommendations.
                        </Text>

                        {/* State Picker Trigger */}
                        <Text style={styles.label}>State</Text>
                        <TouchableOpacity style={styles.selectInput} onPress={() => setShowStatePicker(true)}>
                            <Text style={tempState ? styles.inputText : styles.placeholderText}>
                                {tempState || "Select State"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={theme.colors.textLight} />
                        </TouchableOpacity>

                        {/* City Picker Trigger */}
                        <Text style={styles.label}>City</Text>
                        <TouchableOpacity 
                            style={[styles.selectInput, !tempState && { opacity: 0.5 }]} 
                            onPress={() => tempState && setShowCityPicker(true)}
                            disabled={!tempState}
                        >
                            <Text style={tempCity ? styles.inputText : styles.placeholderText}>
                                {tempCity || "Select City"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={theme.colors.textLight} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveLocation}>
                            <Text style={styles.saveBtnText}>Save Location</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Nested Pickers */}
                    <SearchableSelect 
                        visible={showStatePicker} 
                        data={US_STATES} 
                        onSelect={(val) => { setTempState(val); setTempCity(''); setShowStatePicker(false); }} 
                        onClose={() => setShowStatePicker(false)}
                        title="Select State"
                        placeholder="Search state..."
                    />
                    <SearchableSelect 
                        visible={showCityPicker} 
                        data={MOCK_CITIES} 
                        onSelect={(val) => { setTempCity(val); setShowCityPicker(false); }} 
                        onClose={() => setShowCityPicker(false)}
                        title={`Select City in ${tempState}`}
                        placeholder="Search city..."
                    />
                </View>
            </Modal>

        </ScreenWrapper>
    );
}

// Helper to get color
const getStatusColor = (status: UserState) => {
    switch (status) {
        case 'HEALING': return '#FF9A9E';
        case 'DATING': return '#FF6B6B';
        case 'RELATIONSHIP': return '#a18cd1';
        default: return theme.colors.primary;
    }
};

const styles = StyleSheet.create({
    container: { paddingBottom: 40 },
    headerTitle: { fontSize: 32, fontWeight: '800', color: theme.colors.text, marginBottom: 20 },
    profileCard: { marginBottom: 30, padding: 20 },
    avatarContainer: { flexDirection: 'row', alignItems: 'center' },
    avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    avatarText: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    userInfo: { flex: 1 },
    userName: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
    badgeText: { fontSize: 12, fontWeight: 'bold' },
    userMeta: { fontSize: 13, color: theme.colors.textLight, marginLeft: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textLight, marginBottom: 10, marginLeft: 4, textTransform: 'uppercase' },
    menuCard: { padding: 0, marginBottom: 24, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuTextContainer: { flex: 1 },
    menuTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    menuSubtitle: { fontSize: 12, color: theme.colors.textLight, marginTop: 2 },
    divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 68 },
    versionText: { textAlign: 'center', color: theme.colors.textLighter, fontSize: 12, marginTop: 20 },
    valueBadge: { marginRight: 8, backgroundColor: '#F0F2F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, maxWidth: 100 },
    valueBadgeText: { fontSize: 12, color: theme.colors.textLight },

    // Modal Common
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', backgroundColor: theme.colors.card, borderRadius: 24, padding: 24, ...theme.shadows.large },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8, textAlign: 'center' },
    modalSubtitle: { fontSize: 16, color: theme.colors.textLight, marginBottom: 24, textAlign: 'center' },
    optionButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: theme.colors.background, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
    optionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    optionText: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    cancelButton: { marginTop: 12, padding: 16, alignItems: 'center' },
    cancelButtonText: { fontSize: 16, color: theme.colors.textLight, fontWeight: '600' },

    // Sheet Modal (Location)
    sheetContainer: { flex: 1, backgroundColor: '#FFF', paddingTop: 20 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    sheetTitle: { fontSize: 18, fontWeight: 'bold' },
    closeText: { fontSize: 16, color: theme.colors.primary, fontWeight: '600' },
    sheetContent: { padding: 20 },
    sheetSubtitle: { fontSize: 14, color: theme.colors.textLight, marginBottom: 24, lineHeight: 20 },
    label: { fontSize: 14, color: theme.colors.text, fontWeight: '600', marginBottom: 8, marginTop: 10 },
    selectInput: { backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    inputText: { fontSize: 16, color: theme.colors.text },
    placeholderText: { fontSize: 16, color: theme.colors.textLight },
    saveBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
    saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    // Search Modal (Reusable)
    modalContainer: { flex: 1, backgroundColor: '#FFF', paddingTop: 60 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    modalSearch: { margin: 20, padding: 12, backgroundColor: '#F0F2F5', borderRadius: 8, fontSize: 16 },
    modalItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
    modalItemText: { fontSize: 16, color: '#333' },

    // Progress Section
    progressSection: { padding: 16 },
    progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
    progressInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 90 },
    progressLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
    progressBarContainer: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    progressCount: { fontSize: 12, color: theme.colors.textLight, fontWeight: '600', width: 40, textAlign: 'right' },

    // Demo Controls
    toggleSwitch: { width: 50, height: 28, backgroundColor: '#E0E0E0', borderRadius: 14, padding: 2, justifyContent: 'center' },
    toggleSwitchOn: { backgroundColor: '#4ECDC4' },
    toggleKnob: { width: 24, height: 24, backgroundColor: '#FFF', borderRadius: 12 },
    toggleKnobOn: { alignSelf: 'flex-end' },
    quickUnlockRow: { flexDirection: 'row', padding: 16, gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
    quickUnlockBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, gap: 6 },
    quickUnlockText: { fontSize: 11, fontWeight: '700' },
});