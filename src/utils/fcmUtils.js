import messaging from '@react-native-firebase/messaging'; // Firebase 메시징 임포트
import notifee, { AndroidImportance, EventType } from '@notifee/react-native'; // Notifee 임포트
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트
import eventEmitter from './EventEmitter'; // 이벤트 에미터 임포트

// 사용자에게 푸시 알림 권한 요청
export const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission(); // 권한 요청
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
};

// FCM 토큰 가져오기
export const getFcmToken = async () => {
    try {
        return await messaging().getToken(); // FCM 토큰 반환
    } catch (error) {
        console.error("FCM 토큰 가져오기 오류:", error);
        return null;
    }
};

// Notifee 초기화 및 채널 생성
export const initializeNotifee = async () => {
    await notifee.requestPermission(); // 알림 권한 요청
    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    }); // 기본 채널 생성
};

// 알림 카운트 증가
export const incrementNotificationCount = async (isBackground = false) => {
    try {
        const currentCount = await AsyncStorage.getItem('notificationCount') || '0'; // 현재 카운트 가져오기
        const newCount = parseInt(currentCount) + 1; // 카운트 증가
        await AsyncStorage.setItem('notificationCount', newCount.toString()); // 새로운 카운트 저장

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
    const title = remoteMessage.notification?.title || '새 알림'; // 제목 설정
    const body = remoteMessage.notification?.body || '새 메시지가 있습니다'; // 본문 설정

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
    await displayNotification(remoteMessage); // 알림 표시
    await incrementNotificationCount(); // 알림 카운트 증가
};

// 백그라운드 메시지 처리
export const handleBackgroundMessage = async (remoteMessage) => {
    console.log('백그라운드 메시지 수신:', remoteMessage);
    await displayNotification(remoteMessage); // 알림 표시
    await incrementNotificationCount(true); // 알림 카운트 증가 (백그라운드)
};

// FCM 리스너 설정 및 구독 해제 함수 반환
export const setupFcmListeners = (navigationRef) => {
    // 포그라운드 메시지 수신 리스너 설정
    const unsubscribeOnMessage = messaging().onMessage(handleForegroundMessage);

    // 백그라운드 상태에서 알림을 클릭하여 앱이 열렸을 때의 리스너 설정
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('백그라운드 상태에서 알림으로 앱 열림:', remoteMessage);
        if (remoteMessage.data?.screen) {
            navigationRef.current?.navigate(remoteMessage.data.screen); // 특정 화면으로 이동
        }
    });

    // 종료 상태에서 알림을 클릭하여 앱이 열렸을 때 처리
    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
            console.log('종료 상태에서 알림으로 앱 열림:', remoteMessage);
            if (remoteMessage.data?.screen) {
                navigationRef.current?.navigate(remoteMessage.data.screen); // 특정 화면으로 이동
            }
        }
    });

    // Notifee 백그라운드 이벤트 리스너 설정
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.PRESS) {
            console.log('사용자가 알림을 눌렀습니다 (백그라운드)', detail.notification);
            // 필요한 경우 추가 처리
        }
    });

    // Notifee 포그라운드 이벤트 리스너 설정
    const unsubscribeNotifeeForegroundEvent = notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
            console.log('사용자가 알림을 눌렀습니다 (포그라운드)', detail.notification);
            // 필요한 경우 추가 처리
        }
    });

    // 구독 해제 함수를 반환하여 언마운트 시점에 호출 가능하도록 함
    return () => {
        unsubscribeOnMessage(); // 포그라운드 메시지 리스너 해제
        unsubscribeOnNotificationOpenedApp(); // 백그라운드 알림 클릭 리스너 해제
        unsubscribeNotifeeForegroundEvent(); // Notifee 포그라운드 이벤트 리스너 해제
    };
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
