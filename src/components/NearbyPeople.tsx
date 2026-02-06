import React from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    Image, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NearbyPerson {
    id: string;
    name: string;
    age: number;
    distance: string;
    imageUrl: string;
    compatibility: number;
    isOnline: boolean;
    bio: string;
}

interface NearbyPeopleProps {
    people: NearbyPerson[];
    onPersonPress?: (person: NearbyPerson) => void;
}

export const NearbyPeople: React.FC<NearbyPeopleProps> = ({ people, onPersonPress }) => {
    if (people.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📍 People Near You</Text>
                <View style={styles.liveBadge}>
                    <View style={styles.liveIndicator} />
                    <Text style={styles.liveText}>Live</Text>
                </View>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {people.slice(0, 6).map((person) => (
                    <TouchableOpacity 
                        key={person.id} 
                        style={styles.personCard}
                        onPress={() => onPersonPress?.(person)}
                        activeOpacity={0.9}
                    >
                        <View style={styles.imageContainer}>
                            <Image 
                                source={{ uri: person.imageUrl }} 
                                style={styles.personImage}
                            />
                            {person.isOnline && <View style={styles.onlineIndicator} />}
                            <View style={styles.distanceBadge}>
                                <Ionicons name="location" size={10} color="#FFF" />
                                <Text style={styles.distanceText}>{person.distance}</Text>
                            </View>
                        </View>
                        <View style={styles.personInfo}>
                            <Text style={styles.personName}>{person.name}, {person.age}</Text>
                            <View style={styles.compatRow}>
                                <View style={styles.compatBar}>
                                    <View style={[styles.compatFill, { width: `${person.compatibility}%` }]} />
                                </View>
                                <Text style={styles.compatText}>{person.compatibility}%</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    liveIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    liveText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    personCard: {
        width: 130,
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        ...theme.shadows.soft,
    },
    imageContainer: {
        position: 'relative',
    },
    personImage: {
        width: 130,
        height: 150,
        backgroundColor: '#F0F0F0',
    },
    onlineIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    distanceBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    distanceText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '600',
    },
    personInfo: {
        padding: 10,
    },
    personName: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 6,
    },
    compatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    compatBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#F0F0F0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    compatFill: {
        height: '100%',
        backgroundColor: theme.colors.success,
        borderRadius: 2,
    },
    compatText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.success,
    },
});

export default NearbyPeople;

