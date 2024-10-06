import PushNotification from 'react-native-push-notification';
import {Alert, Linking, Platform, PushNotificationIOS} from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// 정확한 알람 권한 요청 함수
export const requestExactAlarmPermission = async () => {
    console.log('Requesting exact alarm permission...');
    if (Platform.OS === 'android' && Platform.Version >= 31) {
        const permission = await check(PERMISSIONS.ANDROID.SCHEDULE_EXACT_ALARM);
        handlePermissionResult(permission, 'SCHEDULE_EXACT_ALARM');
    }
};

// 알림 권한 요청 함수 (Android 13+)
export const requestNotificationPermission = async () => {
    console.log('Requesting notification permission...');
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const permission = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        handlePermissionResult(permission, 'POST_NOTIFICATIONS');
    }
};

// 권한 결과 처리 함수
const handlePermissionResult = (permission, permissionType) => {
    switch (permission) {
        case RESULTS.GRANTED:
            console.log(`${permissionType} permission granted.`);
            break;
        case RESULTS.DENIED:
            console.log(`${permissionType} permission denied.`);
            showPermissionAlert(permissionType, false);
            break;
        case RESULTS.BLOCKED:
            console.log(`${permissionType} permission blocked.`);
            showPermissionAlert(permissionType, true);
            break;
        default:
            console.log(`${permissionType} permission unknown state.`);
    }
};

// 권한 알림 표시 함수
const showPermissionAlert = (permissionType, isBlocked) => {
    Alert.alert(
        `${permissionType} 권한 필요`,
        isBlocked
            ? `${permissionType} 권한이 차단되었습니다. 설정에서 수동으로 권한을 허용해주세요.`
            : `${permissionType} 권한이 필요합니다. 설정으로 이동하여 권한을 허용하세요.`,
        [
            { text: '취소', style: 'cancel' },
            { text: '설정으로 이동', onPress: () => Linking.openSettings() },
        ],
        { cancelable: true }
    );
};

// PushNotification 초기화 및 권한 설정
export const initializePushNotifications = () => {
    console.log('Initializing Push Notifications...');

    PushNotification.createChannel(
        {
            channelId: "medication-channel",
            channelName: "Medication Alerts",
            importance: PushNotification.Importance.HIGH,
            vibrate: true,
        },
        (created) => console.log(`createChannel returned '${created}'`)
    );

    PushNotification.configure({
        onRegister: function (token) {
            console.log("TOKEN:", token);
        },
        onNotification: function (notification) {
            console.log('NOTIFICATION:', notification);
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        },
        permissions: {
            alert: true,
            badge: true,
            sound: true,
        },
        popInitialNotification: true,
        requestPermissions: Platform.OS === 'ios',
    });

    requestExactAlarmPermission();
    requestNotificationPermission();
};

// iOS에서의 알림 권한 요청 (AppDelegate.m에서 호출)
export const requestiOSNotificationPermission = () => {
    PushNotification.requestPermissions();
};
