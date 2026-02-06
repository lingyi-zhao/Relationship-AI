import React, { useState, useMemo } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    TextInput, KeyboardAvoidingView, Platform, Alert, Modal, FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAppStore } from '../state/store';
import { theme } from '../theme';
import { UserState } from '../types';

// --- CONSTANTS & DATA ---
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

// Mock Cities for demo (In a real app, this would be an API call based on selected state)
const MOCK_CITIES = [
    "New York City", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", 
    "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", 
    "San Francisco", "Columbus", "Fort Worth", "Indianapolis", "Charlotte", "Seattle", 
    "Denver", "Washington", "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", 
    "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee"
];

const INTEREST_TAGS = [
    "🎵 Music", "🏃‍♂️ Running", "🏋️ Fitness", "🍔 Foodie", "🎬 Movies", 
    "🎮 Gaming", "✈️ Travel", "📷 Photography", "🎨 Art", "📚 Reading", 
    "🏔️ Hiking", "🍷 Wine", "💻 Coding", "🐕 Pets", "🧘 Yoga"
];

const DATING_GOALS = [
    { id: 'long_term', label: 'Long-term Partner', icon: 'heart' },
    { id: 'serious', label: 'Serious Relationship', icon: 'rose' },
    { id: 'casual', label: 'Casual Dating', icon: 'cafe' },
    { id: 'friends', label: 'New Friends', icon: 'people' },
];

const DEGREES = ["High School", "Bachelor's", "Master's", "PhD", "Trade School", "Other"];

// Flow Steps
type Step = 
    | 'BASICS' 
    | 'LOCATION' 
    | 'DETAILS' 
    | 'CAREER' 
    | 'INTERESTS' 
    | 'Q1_STATUS' 
    | 'Q2_SINGLE_INTENT' 
    | 'Q3_REL_HAPPINESS';

// --- HELPER COMPONENT: Searchable Modal ---
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

export default function OnboardingScreen() {
    const { setUserState, completeOnboarding, setUser } = useAppStore();
    
    // Flow State
    const [currentStep, setCurrentStep] = useState<Step>('BASICS');

    // --- Form Data State ---
    // Basics
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    
    // Location
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [showStateModal, setShowStateModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);

    // Details
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    
    // Career & Edu
    const [company, setCompany] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [school, setSchool] = useState('');
    const [degree, setDegree] = useState('');
    const [showDegreeModal, setShowDegreeModal] = useState(false);

    // Interests & Goals
    const [datingGoal, setDatingGoal] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    // --- Logic Handlers ---

    const toggleInterest = (tag: string) => {
        if (selectedInterests.includes(tag)) {
            setSelectedInterests(prev => prev.filter(t => t !== tag));
        } else {
            if (selectedInterests.length >= 5) {
                Alert.alert("Limit Reached", "You can pick up to 5 interests.");
                return;
            }
            setSelectedInterests(prev => [...prev, tag]);
        }
    };

    const validateAndNext = (nextStep: Step) => {
        // Simple validation logic
        if (currentStep === 'BASICS' && (!name.trim() || !age.trim() || !gender)) {
            Alert.alert("Missing Info", "Please fill in all basic fields.");
            return;
        }
        if (currentStep === 'LOCATION' && (!state || !city)) {
            Alert.alert("Missing Info", "Please select your location.");
            return;
        }
        if (currentStep === 'DETAILS' && (!height || !weight)) {
            // Optional: Remove check if you want these to be optional
        }
        if (currentStep === 'INTERESTS' && (!datingGoal || selectedInterests.length === 0)) {
             Alert.alert("Missing Info", "Please select a goal and at least one interest.");
             return;
        }

        setCurrentStep(nextStep);
    };

    const handleFinalSubmit = (finalState: UserState) => {
        // Save comprehensive user profile
        setUser({
            id: 'u1',
            name,
            age: parseInt(age) || 0,
            status: 'single', // legacy field
            interests: selectedInterests,
            // Note: In a real app, you'd add these new fields to your User interface in types/index.ts
            // We are saving them to the store even if TS might complain if types aren't updated yet.
            // @ts-ignore 
            extendedProfile: {
                gender,
                location: `${city}, ${state}`,
                height,
                weight,
                company,
                jobTitle,
                school,
                degree,
                datingGoal
            }
        });

        // Set App State
        setUserState(finalState);
        completeOnboarding();
    };

    // --- Render Steps ---

    const renderBasics = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepIndicator}>Step 1 / 5</Text>
            <Text style={styles.questionTitle}>The Basics</Text>
            
            <Text style={styles.label}>Nickname / Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="How should we call you?" />

            <Text style={styles.label}>Age</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="25" />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.row}>
                {['Male', 'Female', 'Non-binary'].map(g => (
                    <TouchableOpacity 
                        key={g} 
                        style={[styles.chip, gender === g && styles.chipActive]}
                        onPress={() => setGender(g)}
                    >
                        <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => validateAndNext('LOCATION')}>
                <Text style={styles.nextBtnText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    const renderLocation = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepIndicator}>Step 2 / 5</Text>
            <Text style={styles.questionTitle}>Where are you?</Text>
            
            <Text style={styles.label}>State</Text>
            <TouchableOpacity style={styles.selectInput} onPress={() => setShowStateModal(true)}>
                <Text style={state ? styles.inputText : styles.placeholderText}>{state || "Select State"}</Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>

            <Text style={styles.label}>City</Text>
            <TouchableOpacity 
                style={[styles.selectInput, !state && { opacity: 0.5 }]} 
                onPress={() => state && setShowCityModal(true)}
                disabled={!state}
            >
                <Text style={city ? styles.inputText : styles.placeholderText}>{city || "Select City"}</Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextBtn} onPress={() => validateAndNext('DETAILS')}>
                <Text style={styles.nextBtnText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>

            {/* Modals */}
            <SearchableSelect 
                visible={showStateModal} 
                data={US_STATES} 
                onSelect={(val) => { setState(val); setCity(''); setShowStateModal(false); }} 
                onClose={() => setShowStateModal(false)}
                title="Select State"
                placeholder="Type to find state..."
            />
            <SearchableSelect 
                visible={showCityModal} 
                data={MOCK_CITIES} // In real app, filter based on State
                onSelect={(val) => { setCity(val); setShowCityModal(false); }} 
                onClose={() => setShowCityModal(false)}
                title={`Select City in ${state}`}
                placeholder="Type to find city..."
            />
        </View>
    );

    const renderDetails = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepIndicator}>Step 3 / 5</Text>
            <Text style={styles.questionTitle}>About You</Text>

            <View style={styles.rowSpaced}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>Height (cm)</Text>
                    <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="175" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.label}>Weight (kg)</Text>
                    <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="number-pad" placeholder="70" />
                </View>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => validateAndNext('CAREER')}>
                <Text style={styles.nextBtnText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    const renderCareer = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepIndicator}>Step 4 / 5</Text>
            <Text style={styles.questionTitle}>Work & Education</Text>

            <Text style={styles.label}>Job Title</Text>
            <TextInput style={styles.input} value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Data Analyst" />

            <Text style={styles.label}>Company</Text>
            <TextInput style={styles.input} value={company} onChangeText={setCompany} placeholder="e.g. Tech Corp" />

            <Text style={styles.label}>School / University</Text>
            <TextInput style={styles.input} value={school} onChangeText={setSchool} placeholder="e.g. Johns Hopkins" />

            <Text style={styles.label}>Highest Degree</Text>
            <TouchableOpacity style={styles.selectInput} onPress={() => setShowDegreeModal(true)}>
                <Text style={degree ? styles.inputText : styles.placeholderText}>{degree || "Select Degree"}</Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextBtn} onPress={() => validateAndNext('INTERESTS')}>
                <Text style={styles.nextBtnText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>

            <SearchableSelect 
                visible={showDegreeModal} 
                data={DEGREES} 
                onSelect={(val) => { setDegree(val); setShowDegreeModal(false); }} 
                onClose={() => setShowDegreeModal(false)}
                title="Select Degree"
                placeholder="Search degree..."
            />
        </View>
    );

    const renderInterests = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepIndicator}>Step 5 / 5</Text>
            <Text style={styles.questionTitle}>Goals & Interests</Text>

            <Text style={styles.label}>I'm looking for...</Text>
            <View style={styles.grid}>
                {DATING_GOALS.map(g => (
                    <TouchableOpacity 
                        key={g.id} 
                        style={[styles.goalCard, datingGoal === g.id && styles.goalCardActive]}
                        onPress={() => setDatingGoal(g.id)}
                    >
                        <Ionicons name={g.icon as any} size={24} color={datingGoal === g.id ? '#FFF' : theme.colors.primary} />
                        <Text style={[styles.goalText, datingGoal === g.id && styles.goalTextActive]}>{g.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Interests (Pick up to 5)</Text>
            <View style={styles.row}>
                {INTEREST_TAGS.map(tag => (
                    <TouchableOpacity 
                        key={tag} 
                        style={[styles.chip, selectedInterests.includes(tag) && styles.chipActive]}
                        onPress={() => toggleInterest(tag)}
                    >
                        <Text style={[styles.chipText, selectedInterests.includes(tag) && styles.chipTextActive]}>{tag}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => validateAndNext('Q1_STATUS')}>
                <Text style={styles.nextBtnText}>Let's Start!</Text>
                <Ionicons name="checkmark" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    // --- Original Logic for Status Selection ---

    const renderQ1Status = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepIndicator}>Last Thing!</Text>
            <Text style={styles.questionTitle}>Current Status?</Text>
            <TouchableOpacity style={styles.optionBtn} onPress={() => setCurrentStep('Q2_SINGLE_INTENT')}>
                <Ionicons name="person" size={24} color={theme.colors.primary} />
                <Text style={styles.optionText}>I am Single</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn} onPress={() => setCurrentStep('Q3_REL_HAPPINESS')}>
                <Ionicons name="heart" size={24} color={theme.colors.secondary} />
                <Text style={styles.optionText}>In a Relationship</Text>
            </TouchableOpacity>
        </View>
    );

    const renderQ2SingleIntent = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>Ready for the next one?</Text>
            <TouchableOpacity style={styles.optionBtn} onPress={() => handleFinalSubmit('HEALING')}>
                <Ionicons name="bandage" size={24} color="#FF9A9E" />
                <Text style={styles.optionText}>Not yet, still healing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn} onPress={() => handleFinalSubmit('DATING')}>
                <Ionicons name="flame" size={24} color="#FF6B6B" />
                <Text style={styles.optionText}>Yes, ready to meet people</Text>
            </TouchableOpacity>
        </View>
    );

    const renderQ3RelHappiness = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>How is it going?</Text>
            <TouchableOpacity style={styles.optionBtn} onPress={() => handleFinalSubmit('HEALING')}>
                <Ionicons name="thunderstorm" size={24} color="#74B9FF" />
                <Text style={styles.optionText}>It's complicated / Painful</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn} onPress={() => handleFinalSubmit('RELATIONSHIP')}>
                <Ionicons name="sunny" size={24} color="#FDCB6E" />
                <Text style={styles.optionText}>Happy / Want to grow</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {currentStep === 'BASICS' && renderBasics()}
                    {currentStep === 'LOCATION' && renderLocation()}
                    {currentStep === 'DETAILS' && renderDetails()}
                    {currentStep === 'CAREER' && renderCareer()}
                    {currentStep === 'INTERESTS' && renderInterests()}
                    {currentStep === 'Q1_STATUS' && renderQ1Status()}
                    {currentStep === 'Q2_SINGLE_INTENT' && renderQ2SingleIntent()}
                    {currentStep === 'Q3_REL_HAPPINESS' && renderQ3RelHappiness()}
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1, padding: 20, paddingBottom: 50 },
    stepContainer: { width: '100%' },
    stepIndicator: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8, textTransform: 'uppercase' },
    questionTitle: { fontSize: 28, fontWeight: '800', color: theme.colors.text, marginBottom: 24 },
    label: { fontSize: 14, color: theme.colors.text, fontWeight: '600', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: theme.colors.border },
    selectInput: { backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    inputText: { fontSize: 16, color: theme.colors.text },
    placeholderText: { fontSize: 16, color: theme.colors.textLight },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    rowSpaced: { flexDirection: 'row', justifyContent: 'space-between' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
    chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { fontSize: 14, color: theme.colors.text },
    chipTextActive: { color: '#FFF', fontWeight: 'bold' },
    goalCard: { width: '48%', backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, gap: 8 },
    goalCardActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    goalText: { fontSize: 12, fontWeight: '600', color: theme.colors.text, textAlign: 'center' },
    goalTextActive: { color: '#FFF' },
    nextBtn: { flexDirection: 'row', backgroundColor: theme.colors.primary, padding: 16, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 32, ...theme.shadows.medium },
    nextBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
    optionBtn: { backgroundColor: theme.colors.card, padding: 20, borderRadius: 16, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', gap: 16, ...theme.shadows.soft },
    optionText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    
    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: '#FFF', paddingTop: 60 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalSearch: { margin: 20, padding: 12, backgroundColor: '#F0F2F5', borderRadius: 8, fontSize: 16 },
    modalItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
    modalItemText: { fontSize: 16, color: '#333' },
});