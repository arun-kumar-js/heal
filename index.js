/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Preload vector icons fonts
import 'react-native-vector-icons/FontAwesome5';

AppRegistry.registerComponent(appName, () => App);
