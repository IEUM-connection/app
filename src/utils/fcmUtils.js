import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import axios from 'axios';

const API_URL = 'YOUR_SERVER_API_URL'; // 서버 API URL을 여기에 입력하세요

export const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
};

export const getFcmToken = async () => {
    try {
        const token = await messaging().getToken();
        if (token) {
            console.log("Your Firebase Token is:", token);
            return token;
        } else {
            console.log("Failed to get token");
            return null;
        }
    } catch (error) {
        console.error("Error getting FCM token:", error);
        return null;
    }
};

export const registerFcmTokenWithServer = async (userId) => {
    try {
        const token = await getFcmToken();
        if (token) {
            const response = await axios.post(`${API_URL}/register-fcm-token`, {
                userId: userId,
                fcmToken: token
            });
            console.log('FCM token registered with server:', response.data);
        }
    } catch (error) {
        console.error('Error registering FCM token with server:', error);
    }
};

export const initializeNotifee = async () => {
    await notifee.requestPermission();

    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });
};

export const handleForegroundMessage = async (remoteMessage) => {
    console.log('Foreground message received:', remoteMessage);

    const title = remoteMessage.data?.title || remoteMessage.notification?.title || 'New Notification';
    const body = remoteMessage.data?.body || remoteMessage.notification?.body || 'You have a new message';

    await notifee.displayNotification({
        title: title,
        body: body,
        android: {
            channelId: 'default',
            pressAction: {
                id: 'default',
            },
        },
    });

    if (remoteMessage.data) {
        console.log('Notification data:', remoteMessage.data);
    }
};

export const handleBackgroundMessage = async (remoteMessage) => {
    console.log('Handling background message:', remoteMessage);

    const title = remoteMessage.data?.title || remoteMessage.notification?.title || 'New Notification';
    const body = remoteMessage.data?.body || remoteMessage.notification?.body || 'You have a new message';

    await notifee.displayNotification({
        title: title,
        body: body,
        android: {
            channelId: 'default',
            pressAction: {
                id: 'default',
            },
        },
    });
};

export const setupFcmListeners = (navigationRef) => {
    const unsubscribeForeground = messaging().onMessage(handleForegroundMessage);

    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification caused app to open from background state:', remoteMessage);
        if (navigationRef.current) {
            if (remoteMessage.data?.screen) {
                navigationRef.current.navigate(remoteMessage.data.screen);
            }
        }
    });

    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
            console.log('Notification caused app to open from quit state:', remoteMessage);
            if (navigationRef.current) {
                if (remoteMessage.data?.screen) {
                    navigationRef.current.navigate(remoteMessage.data.screen);
                }
            }
        }
    });

    return () => {
        unsubscribeForeground();
        unsubscribeBackground();
    };
};

export const setupBackgroundHandler = () => {
    messaging().setBackgroundMessageHandler(handleBackgroundMessage);

    notifee.onBackgroundEvent(async ({ type, detail }) => {
        const { notification, pressAction } = detail;

        switch (type) {
            case EventType.DISMISSED:
                console.log('User dismissed notification', notification);
                break;
            case EventType.PRESS:
                console.log('User pressed notification', notification);
                // 여기에 알림을 눌렀을 때의 동작을 추가할 수 있습니다.
                break;
            default:
                console.log('Unknown event type', type);
        }
    });
};
