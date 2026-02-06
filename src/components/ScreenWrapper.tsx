import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, StatusBar, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style }) => {
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            <View style={[styles.content, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: isSmallScreen ? theme.spacing.m : theme.spacing.l,
        paddingTop: Platform.OS === 'ios' ? theme.spacing.s : theme.spacing.m,
    },
});

export default ScreenWrapper;
