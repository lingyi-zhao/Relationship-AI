import React, { useState, useRef } from 'react';
import { 
    View, StyleSheet, Animated, Dimensions, TouchableOpacity, Text 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetRenderer } from './WidgetRenderer';
import { InstructorWidget } from '../types';
import { theme } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
    widget: InstructorWidget;
    onLike: (id: string, type: string) => void;
    onDislike: (id: string) => void;
}

/**
 * InteractiveWidget Component
 * * This is a wrapper around the static WidgetRenderer.
 * It adds interaction layers (Like/Dislike buttons) and handles the 
 * exit animations (swiping off-screen) when a user interacts with a card.
 */
export const InteractiveWidget: React.FC<Props> = ({ widget, onLike, onDislike }) => {
    // Controls whether the component is rendered in the DOM
    const [isVisible, setIsVisible] = useState(true);
    
    // Animation Values
    // 'position' controls the X/Y coordinates for the swipe effect
    const position = useRef(new Animated.ValueXY()).current;
    // 'opacity' fades out the card as it swipes away
    const opacity = useRef(new Animated.Value(1)).current;

    /**
     * Handles the "Like" action.
     * Animates the card off-screen to the RIGHT and triggers the onLike callback.
     */
    const handleLike = () => {
        Animated.parallel([
            Animated.timing(position, {
                toValue: { x: 500, y: -50 }, // Fly out to the right and slightly up
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Unmount/Hide after animation completes
            setIsVisible(false);
            onLike(widget.id, widget.type);
        });
    };

    /**
     * Handles the "Dislike" action.
     * Animates the card off-screen to the LEFT and triggers the onDislike callback.
     */
    const handleDislike = () => {
        Animated.parallel([
            Animated.timing(position, {
                toValue: { x: -500, y: 50 }, // Fly out to the left and slightly down
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start(() => {
            setIsVisible(false);
            onDislike(widget.id);
        });
    };

    // If invisible (after interaction), do not render anything to save resources
    if (!isVisible) return null;

    // Interpolate rotation based on X position
    // As the card moves right, it tilts right (10deg). As it moves left, it tilts left (-10deg).
    const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp'
    });

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.cardContainer, 
                    { 
                        // Bind animation values to style
                        transform: [
                            { translateX: position.x }, 
                            { translateY: position.y },
                            { rotate: rotate }
                        ],
                        opacity: opacity
                    }
                ]}
            >
                {/* 1. Render the actual content (The Card) */}
                <WidgetRenderer widget={widget} />

                {/* 2. Action Bar (Like/Dislike Buttons) */}
                {/* We overlay this slightly on the bottom of the card */}
                <View style={styles.actionBar}>
                    {/* Dislike Button (Cross) */}
                    <TouchableOpacity style={[styles.btn, styles.dislikeBtn]} onPress={handleDislike}>
                        <Ionicons name="close" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                    
                    {/* Feedback Prompt */}
                    <Text style={styles.feedbackText}>Helpful?</Text>

                    {/* Like Button (Heart) */}
                    <TouchableOpacity style={[styles.btn, styles.likeBtn]} onPress={handleLike}>
                        <Ionicons name="heart" size={24} color="#4ECDC4" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        alignItems: 'center',
        // Ensure buttons are clickable and not clipped
        zIndex: 1, 
    },
    cardContainer: {
        width: '100%',
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: -28, // Negative margin pulls the buttons up to overlap the card bottom
        marginBottom: 10,
        zIndex: 10,     // Ensures buttons are above the card content
    },
    feedbackText: {
        fontSize: 12,
        color: theme.colors.textLight,
        fontWeight: '600',
        backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent background for readability
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    btn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for elevation (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Elevation (Android)
        elevation: 3,
    },
    dislikeBtn: {
        borderWidth: 1,
        borderColor: '#FF6B6B', // Red border
    },
    likeBtn: {
        backgroundColor: '#F0FFF4', // Very light green bg
        borderWidth: 1,
        borderColor: '#4ECDC4', // Teal border
    }
});