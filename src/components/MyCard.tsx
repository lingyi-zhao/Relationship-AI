import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface MyCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'elevated' | 'gradient';
    gradientColors?: string[];
}

const MyCard: React.FC<MyCardProps> = ({ children, style, variant = 'default', gradientColors }) => {
    const getCardStyle = () => {
        switch (variant) {
            case 'elevated':
                return [styles.card, styles.cardElevated, style];
            case 'gradient':
                return [styles.card, styles.cardGradient, style];
            default:
                return [styles.card, style];
        }
    };

    return (
        <View style={getCardStyle()}>
            {variant === 'gradient' && gradientColors && (
                <View style={[styles.gradientOverlay, { 
                    backgroundColor: gradientColors[0] + '10',
                }]} />
            )}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.l,
        marginVertical: theme.spacing.xs,
        ...theme.shadows.card,
        overflow: 'hidden',
    },
    cardElevated: {
        ...theme.shadows.large,
        backgroundColor: theme.colors.cardElevated,
    },
    cardGradient: {
        position: 'relative',
        backgroundColor: theme.colors.card,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default MyCard;
