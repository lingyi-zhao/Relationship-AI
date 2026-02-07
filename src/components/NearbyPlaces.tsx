import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    Image, Linking, ActivityIndicator, Dimensions, Alert
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAppStore } from '../state/store';
import { GeminiService } from '../services/gemini/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

// Premium place images (Unsplash)
const PLACE_IMAGES = {
    restaurant: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    ],
    cafe: [
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    ],
    park: [
        'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400',
    ],
    bar: [
        'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
        'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400',
    ],
    museum: [
        'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400',
        'https://images.unsplash.com/photo-1565060169194-19fabf63012c?w=400',
    ],
    default: [
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
    ],
};

interface NearbyPlace {
    id: string;
    name: string;
    type: 'restaurant' | 'cafe' | 'park' | 'bar' | 'museum' | 'default';
    rating: number;
    distance: string;
    priceLevel: string;
    imageUrl: string;
    address: string;
    reason: string;
    latitude: number;
    longitude: number;
}

// Mock nearby places based on user location context
const generateFallbackPlaces = (context: 'healing' | 'dating' | 'relationship'): NearbyPlace[] => {
    const healingPlaces: NearbyPlace[] = [
        {
            id: 'p1',
            name: 'Serenity Tea House',
            type: 'cafe',
            rating: 4.8,
            distance: '0.3 mi',
            priceLevel: '$$',
            imageUrl: PLACE_IMAGES.cafe[0],
            address: '123 Peaceful Lane',
            reason: 'Quiet atmosphere perfect for reflection',
            latitude: 37.7749,
            longitude: -122.4194,
        },
        {
            id: 'p2',
            name: 'Botanical Gardens',
            type: 'park',
            rating: 4.9,
            distance: '0.8 mi',
            priceLevel: 'Free',
            imageUrl: PLACE_IMAGES.park[0],
            address: '456 Nature Way',
            reason: 'Peaceful walks to clear your mind',
            latitude: 37.7749,
            longitude: -122.4194,
        },
    ];

    const datingPlaces: NearbyPlace[] = [
        {
            id: 'd1',
            name: 'Rooftop Lounge',
            type: 'bar',
            rating: 4.7,
            distance: '0.4 mi',
            priceLevel: '$$$',
            imageUrl: PLACE_IMAGES.bar[0],
            address: '100 Skyline Blvd',
            reason: 'Perfect for first date drinks',
            latitude: 37.7749,
            longitude: -122.4194,
        },
        {
            id: 'd2',
            name: 'Artisan Kitchen',
            type: 'restaurant',
            rating: 4.8,
            distance: '0.6 mi',
            priceLevel: '$$$',
            imageUrl: PLACE_IMAGES.restaurant[0],
            address: '200 Gourmet Ave',
            reason: 'Romantic ambiance & great food',
            latitude: 37.7749,
            longitude: -122.4194,
        },
    ];

    const relationshipPlaces: NearbyPlace[] = [
        {
            id: 'r1',
            name: 'Couples Spa Retreat',
            type: 'default',
            rating: 4.9,
            distance: '1.5 mi',
            priceLevel: '$$$$',
            imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
            address: '500 Wellness Blvd',
            reason: 'Quality time together',
            latitude: 37.7749,
            longitude: -122.4194,
        },
        {
            id: 'r2',
            name: 'Italian Trattoria',
            type: 'restaurant',
            rating: 4.7,
            distance: '0.9 mi',
            priceLevel: '$$$',
            imageUrl: PLACE_IMAGES.restaurant[1],
            address: '600 Romance Lane',
            reason: 'Anniversary dinner spot',
            latitude: 37.7749,
            longitude: -122.4194,
        },
    ];

    switch (context) {
        case 'healing': return healingPlaces;
        case 'dating': return datingPlaces;
        case 'relationship': return relationshipPlaces;
        default: return datingPlaces;
    }
};

interface NearbyPlacesProps {
    context?: 'healing' | 'dating' | 'relationship';
    title?: string;
}

export const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ 
    context = 'dating',
    title = '📍 Nearby Spots For You'
}) => {
    const { setUserLocation, userLocation } = useAppStore();
    const [loading, setLoading] = useState(true);
    const [places, setPlaces] = useState<NearbyPlace[]>([]);
    const [locationName, setLocationName] = useState('');

    useEffect(() => {
        requestLocation();
    }, [context]);

    const requestLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Use fallback
                await generateAIPlaces('San Francisco, CA');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            // Reverse geocode for location name
            const [address] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            
            const cityName = address ? `${address.city || address.district}, ${address.region}` : 'Your Area';
            setLocationName(cityName);
            
            // Generate AI places
            await generateAIPlaces(cityName);
        } catch (error) {
            console.log('Location error:', error);
            await generateAIPlaces('Your Area');
        }
    };

    const generateAIPlaces = async (locationName: string) => {
        if (!GeminiService.isConfigured()) {
            // Use fallback
            setLocationName(locationName);
            setPlaces(generateFallbackPlaces(context));
            setLoading(false);
            return;
        }

        try {
            const response = await GeminiService.generateNearbyPlaces(
                locationName,
                context
            );

            const parsed = JSON.parse(response);
            const aiPlaces: NearbyPlace[] = parsed.places.map((p: any) => ({
                id: p.id,
                name: p.name,
                type: p.type,
                rating: p.rating,
                distance: p.distance,
                priceLevel: p.priceLevel,
                address: p.address,
                reason: p.reason,
                imageUrl: getImageForPlace(p.type),
                latitude: 37.7749, // Would use real geocoding in production
                longitude: -122.4194,
            }));

            setPlaces(aiPlaces);
        } catch (error) {
            console.error('AI places error:', error);
            // Fallback to mock data
            setPlaces(generateFallbackPlaces(context));
        } finally {
            setLoading(false);
        }
    };

    const getImageForPlace = (type: string): string => {
        const images = PLACE_IMAGES[type as keyof typeof PLACE_IMAGES] || PLACE_IMAGES.default;
        return images[Math.floor(Math.random() * images.length)];
    };

    const openInMaps = (place: NearbyPlace) => {
        const query = encodeURIComponent(`${place.name} ${place.address}`);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Finding places near you...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.locationBadge}>
                    <Ionicons name="location" size={14} color={theme.colors.primary} />
                    <Text style={styles.locationText}>{locationName}</Text>
                </View>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {places.map((place) => (
                    <TouchableOpacity 
                        key={place.id} 
                        style={styles.placeCard}
                        onPress={() => openInMaps(place)}
                        activeOpacity={0.9}
                    >
                        <Image 
                            source={{ uri: place.imageUrl }} 
                            style={styles.placeImage}
                        />
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingText}>{place.rating}</Text>
                        </View>
                        <View style={styles.priceBadge}>
                            <Text style={styles.priceText}>{place.priceLevel}</Text>
                        </View>
                        <View style={styles.placeInfo}>
                            <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                            <View style={styles.placeMetaRow}>
                                <View style={styles.distanceBadge}>
                                    <Ionicons name="walk" size={12} color={theme.colors.textLight} />
                                    <Text style={styles.distanceText}>{place.distance}</Text>
                                </View>
                                <Text style={styles.typeBadge}>{place.type}</Text>
                            </View>
                            <Text style={styles.reasonText}>💡 {place.reason}</Text>
                            <TouchableOpacity style={styles.directionsBtn} onPress={() => openInMaps(place)}>
                                <Ionicons name="navigate" size={14} color="#FFF" />
                                <Text style={styles.directionsBtnText}>Directions</Text>
                            </TouchableOpacity>
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
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: theme.colors.textLight,
        fontSize: 14,
    },
    scrollContent: {
        paddingLeft: 4,
        paddingRight: 20,
        gap: 16,
    },
    placeCard: {
        width: CARD_WIDTH,
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        ...theme.shadows.medium,
    },
    placeImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#F0F0F0',
    },
    ratingBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    priceBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.text,
    },
    placeInfo: {
        padding: 16,
    },
    placeName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
    },
    placeMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    distanceText: {
        fontSize: 12,
        color: theme.colors.textLight,
    },
    typeBadge: {
        backgroundColor: theme.colors.secondary + '20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        fontSize: 11,
        color: theme.colors.secondary,
        fontWeight: '600',
        textTransform: 'capitalize',
        overflow: 'hidden',
    },
    reasonText: {
        fontSize: 13,
        color: theme.colors.textLight,
        marginBottom: 12,
        lineHeight: 18,
    },
    directionsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    directionsBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default NearbyPlaces;


