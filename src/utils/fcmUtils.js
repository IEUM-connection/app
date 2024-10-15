import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventEmitter from './EventEmitter';

// 사용자에게 푸시 알림 권한 요청
export const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
};

// FCM 토큰 가져오기
export const getFcmToken = async () => {
    try {
        return await messaging().getToken();
    } catch (error) {
        console.error("FCM 토큰 가져오기 오류:", error);
        return null;
    }
};

// Notifee 초기화 및 채널 생성
export const initializeNotifee = async () => {
    await notifee.requestPermission();
    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });
};

// 알림 카운트 증가
export const incrementNotificationCount = async (isBackground = false) => {
    try {
        const currentCount = await AsyncStorage.getItem('notificationCount') || '0';
        const newCount = parseInt(currentCount) + 1;
        await AsyncStorage.setItem('notificationCount', newCount.toString());

        if (!isBackground) {
            // 포그라운드에서만 이벤트 발생
            eventEmitter.emit('notificationCountUpdated', newCount);
        }
    } catch (error) {
        console.error('알림 카운트 증가 오류:', error);
    }
};

// 알림 표시
const displayNotification = async (remoteMessage) => {
    const title = remoteMessage.notification?.title || '새 알림';
    const body = remoteMessage.notification?.body || '새 메시지가 있습니다';

    await notifee.displayNotification({
        title,
        body,
        android: {
            channelId: 'default',
            pressAction: {
                id: 'default',
            },
        },
    });
};

// 포그라운드 메시지 처리
export const handleForegroundMessage = async (remoteMessage) => {
    console.log('포그라운드 메시지 수신:', remoteMessage);
    await displayNotification(remoteMessage);
    await incrementNotificationCount();
};

// 백그라운드 메시지 처리
export const handleBackgroundMessage = async (remoteMessage) => {
    console.log('백그라운드 메시지 수신:', remoteMessage);
    await displayNotification(remoteMessage);
    await incrementNotificationCount(true);
};

// FCM 리스너 설정
export const setupFcmListeners = (navigation) => {
    messaging().onMessage(handleForegroundMessage);
    messaging().setBackgroundMessageHandler(handleBackgroundMessage);

    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('백그라운드 상태에서 알림으로 앱 열림:', remoteMessage);
        if (remoteMessage.data?.screen) {
            navigation.navigate(remoteMessage.data.screen);
        }
    });

    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
            console.log('종료 상태에서 알림으로 앱 열림:', remoteMessage);
            if (remoteMessage.data?.screen) {
                navigation.navigate(remoteMessage.data.screen);
            }
        }
    });

    notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.PRESS) {
            console.log('사용자가 알림을 눌렀습니다', detail.notification);
        }
    });
};

// 현재 알림 카운트 가져오기
export const getNotificationCount = async () => {
    try {
        const count = await AsyncStorage.getItem('notificationCount') || '0';
        return parseInt(count);
    } catch (error) {
        console.error('알림 카운트 가져오기 오류:', error);
        return 0;
    }
};

// 알림 카운트 리셋
export const resetNotificationCount = async () => {
    try {
        await AsyncStorage.setItem('notificationCount', '0');
        eventEmitter.emit('notificationCountUpdated', 0);
    } catch (error) {
        console.error('알림 카운트 리셋 오류:', error);
    }
};
