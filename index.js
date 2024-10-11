/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// 백그라운드 메시지 핸들러 설정
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    // 여기에 백그라운드에서 메시지를 처리하는 로직을 추가합니다.
});

AppRegistry.registerComponent(appName, () => App);
