import React from 'react';
import { 
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Alert, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { InstructorItem, InstructorWidget } from '../types';

const CARD_WIDTH = Dimensions.get('window').width * 0.75; // The card width occupies 75% of the screen.

interface Props {
    widget: InstructorWidget;
    onItemLike: (item: InstructorItem) => void;
    onItemDislike: (item: InstructorItem) => void;
}

export const CarouselWidget: React.FC<Props> = ({ widget, onItemLike, onItemDislike }) => {
    
    // ✅ Helper: Get Icon & Color based on Widget Type
    const getCategoryIcon = (type: string) => {
        switch (type) {
            case 'place_card': return { name: 'location', color: '#2196F3', bg: '#E3F2FD' };
            case 'travel_idea': return { name: 'airplane', color: '#00BCD4', bg: '#E0F7FA' };
            case 'music_playlist': return { name: 'musical-notes', color: '#E91E63', bg: '#FCE4EC' };
            case 'movie_list': return { name: 'videocam', color: '#F44336', bg: '#FFEBEE' };
            case 'book_list': return { name: 'book', color: '#8D6E63', bg: '#EFEBE9' };
            default: return { name: 'layers', color: '#607D8B', bg: '#ECEFF1' };
        }
    };

    const iconData = getCategoryIcon(widget.type);

    const handlePress = (item: InstructorItem) => {
        let url = '';
        const query = encodeURIComponent(item.linkQuery || item.title);

        // The type determines where to direct.
        switch (item.type) {
            case 'place':
                url = `https://www.google.com/maps/search/?api=1&query=${query}`;
                break;
            case 'music':
                url = `https://open.spotify.com/search/${query}`;
                break;
            case 'movie':
                url = `https://www.youtube.com/results?search_query=${query}+trailer`;
                break;
            case 'book':
                url = `https://www.google.com/search?q=${query}+book`;
                break;
            default:
                url = `https://www.google.com/search?q=${query}`;
        }

        Linking.openURL(url).catch(() => Alert.alert("Oops", "Cannot open link"));
    };

    // Generate images based on keywords using Pollinations AI (free, fast, no key required).
    const getImageUrl = (query: string) => {
        const encoded = encodeURIComponent(query);
        return `https://image.pollinations.ai/prompt/${encoded}?width=400&height=300&nologo=true`;
    };

    return (
        <View style={styles.container}>
            {/* ✅ Widget Header with Icon */}
            <View style={styles.headerRow}>
                <View style={[styles.iconContainer, { backgroundColor: iconData.bg }]}>
                    <Ionicons name={iconData.name as any} size={20} color={iconData.color} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>{widget.title}</Text>
                    {widget.subtitle && <Text style={styles.subtitle}>{widget.subtitle}</Text>}
                </View>
            </View>

            {/* Horizontal Scroll List */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + 16} // Make the card slide with an adhesive effect
            >
                {widget.content.items?.map((item, index) => (
                    <TouchableOpacity 
                        key={item.id || index} 
                        style={styles.itemCard}
                        activeOpacity={0.9}
                        onPress={() => handlePress(item)}
                    >
                        {/* 1. Image Cover */}
                        <Image 
                            source={{ uri: getImageUrl(item.query || item.title) }} 
                            style={styles.itemImage} 
                            resizeMode="cover"
                        />
                        
                        {/* 2. Content Overlay */}
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.itemSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                            
                            {/* 3. Action Row (Like/Dislike) */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity 
                                    style={[styles.iconBtn, styles.dislikeBtn]} 
                                    onPress={(e) => { e.stopPropagation(); onItemDislike(item); }}
                                >
                                    <Ionicons name="close" size={18} color="#FF6B6B" />
                                </TouchableOpacity>
                                
                                <View style={styles.linkHint}>
                                    <Text style={styles.linkText}>Tap to open</Text>
                                    <Ionicons name="open-outline" size={12} color="#FFF" />
                                </View>

                                <TouchableOpacity 
                                    style={[styles.iconBtn, styles.likeBtn]} 
                                    onPress={(e) => { e.stopPropagation(); onItemLike(item); }}
                                >
                                    <Ionicons name="heart" size={18} color="#4ECDC4" />
                                </TouchableOpacity>
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
    // ✅ Updated Header Styles for Icon Layout
    headerRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        marginBottom: 16 
    },
    iconContainer: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 12 
    },
    headerText: { 
        flex: 1 
    },
    title: {
        fontSize: 18, // Slightly adjusted for balance with icon
        fontWeight: '800',
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textLight,
        marginTop: 2,
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    itemCard: {
        width: CARD_WIDTH,
        height: 220,
        marginRight: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        ...theme.shadows.medium,
        overflow: 'hidden',
        position: 'relative',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    itemContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        // Gradient overlay simulation using transparent black
        backgroundColor: 'rgba(0,0,0,0.6)', 
        height: '45%',
        justifyContent: 'flex-end',
    },
    itemTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    itemSubtitle: {
        color: '#DDD',
        fontSize: 14,
        marginBottom: 12,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dislikeBtn: {},
    likeBtn: {},
    linkHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        opacity: 0.8
    },
    linkText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase'
    }
});