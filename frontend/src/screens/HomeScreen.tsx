import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MD3Theme } from 'react-native-paper';

// Define possible states
type SystemStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

const HomeScreen = () => {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  // State for the current system status - defaulting to IDLE
  const [currentStatus, setCurrentStatus] = useState<SystemStatus>('IDLE');

  // Helper function to render status indicator
  const renderStatusIndicator = () => {
    switch (currentStatus) {
      case 'LISTENING':
        // TODO: Replace with a better visual indicator, e.g., mic icon
        return <Text style={styles.statusText}>Listening...</Text>;
      case 'THINKING':
        return <ActivityIndicator animating={true} color={theme.colors.primary} size="small" style={styles.statusIndicator} />;
      case 'SPEAKING':
        // TODO: Replace with a better visual indicator, e.g., speaker icon or animation
        return <Text style={styles.statusText}>Speaking...</Text>;
      case 'IDLE':
      default:
        return <Text style={styles.statusText}>Idle</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {/* Placeholder for Three.js Visual Companion */}
      <View style={styles.visualCompanionPlaceholder}>
        <Text style={styles.placeholderText}>[Visual Companion Area]</Text>
      </View>

      <Text style={styles.title}>Ambi Home Screen</Text>
      {/* Placeholder for conversation UI */}
      
      {/* System Status Display */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status: </Text>
        {renderStatusIndicator()}
      </View>

      {/* TODO: Add buttons for temporary state change testing if needed */}
    </View>
  );
};

const createStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center', // Adjust alignment if needed
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  visualCompanionPlaceholder: { // Style for the placeholder
    width: '80%',
    height: 150,
    backgroundColor: theme.colors.surfaceVariant, // Use a theme color
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  placeholderText: { // Style for text inside placeholder
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 40, // Increased margin
  },
  statusContainer: { // Style for status row
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  statusLabel: {
    fontSize: 16,
    color: theme.colors.secondary,
    marginRight: 5,
  },
  statusText: { // Style for text status
    fontSize: 16,
    color: theme.colors.secondary,
    fontStyle: 'italic',
  },
  statusIndicator: { // Style for ActivityIndicator
    marginLeft: 5, 
  }
});

export default HomeScreen; 