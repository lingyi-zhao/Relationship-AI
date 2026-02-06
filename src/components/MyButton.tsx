import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface MyButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    size?: 'default' | 'large';
}

const MyButton: React.FC<MyButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    size = 'default'
}) => {
    const getBackgroundColor = () => {
        if (disabled) return theme.colors.textLighter;
        switch (variant) {
            case 'secondary': return theme.colors.secondary;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            case 'primary':
            default: return theme.colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return '#FFFFFF';
        switch (variant) {
            case 'outline': return theme.colors.primary;
            case 'ghost': return theme.colors.text;
            default: return '#FFFFFF';
        }
    };

    const getBorderStyle = () => {
        if (variant === 'outline') {
            return { borderColor: theme.colors.primary, borderWidth: 2 };
        }
        if (variant === 'ghost') {
            return {};
        }
        return {};
    };

    const getPadding = () => {
        if (size === 'large') {
            return { paddingVertical: theme.spacing.l, paddingHorizontal: theme.spacing.xl };
        }
        return { paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.l };
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getPadding(),
                { backgroundColor: getBackgroundColor() },
                getBorderStyle(),
                !disabled && styles.shadow,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.85}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <Text style={[
                    size === 'large' ? styles.textLarge : styles.text, 
                    { color: getTextColor() }
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: theme.spacing.xs,
        minHeight: 52,
        minWidth: 120, // Ensure touch targets are adequate
    },
    shadow: {
        ...theme.shadows.medium,
    },
    text: {
        ...theme.typography.button,
    },
    textLarge: {
        ...theme.typography.buttonLarge,
    },
});

export default MyButton;
