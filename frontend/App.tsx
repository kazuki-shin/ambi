/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  Provider as PaperProvider,
  // MD3Theme, // Theme type not needed directly here anymore
} from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import store from './src/store';
import AppNavigator from './src/navigation/AppNavigator'; // Import the navigator

// Removing default RN template imports as we replace the UI
// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';

function App(): React.JSX.Element {
  // const scheme = useColorScheme();
  // TODO: Configure custom themes later if needed
  // const theme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <ReduxProvider store={store}>
      <PaperProvider /* theme={theme} */>
        {/* Render the AppNavigator instead of direct content */}
        <AppNavigator />
      </PaperProvider>
    </ReduxProvider>
  );
}

// Remove AppContent and related imports/styles as navigation handles screen rendering
/*
// Separate component to access theme context from PaperProvider
const AppContent = () => {
  // ... removed code ...
}

const createStyles = (theme: MD3Theme) => StyleSheet.create({
  // ... removed code ...
});
*/

export default App;
