// alarmUtils.js

import PushNotification from 'react-native-push-notification';
import { Alert, Linking, Platform, PushNotificationIOS } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { NativeModules } from 'react-native';

const { AlarmPermissionModule } = NativeModules;

// 정확한 알람 권한 확인 함수
export const checkExactAlarmPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
        try {
            const hasPermission = await AlarmPermissionModule.checkAlarmPermission();
            console.log('Exact alarm permission:', hasPermission);
            return hasPermission;
        } catch (error) {
            console.error('Error checking exact alarm permission:', error);
            return false;
        }
    } else {
        return true; // iOS 또는 Android 12 미만은 권한 필요 없음
    }
};

// 정확한 알람 권한 요청 함수 (경고창 표시 후 설정 화면으로 이동)
export const requestExactAlarmPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
        const hasPermission = await checkExactAlarmPermission();
        if (!hasPermission) {
            Alert.alert(
                '정확한 알람 권한 필요',
                '정확한 알람 기능을 사용하려면 권한이 필요합니다. 설정 화면으로 이동하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    { text: '설정으로 이동', onPress: () => AlarmPermissionModule.requestAlarmPermission() },
                ],
                { cancelable: true }
            );
        } else {
            console.log('정확한 알람 권한이 이미 허용되었습니다.');
        }
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
            console.log(`${permissionType} 권한 허용됨.`);
            break;
        case RESULTS.DENIED:
        case RESULTS.BLOCKED:
            console.log(`${permissionType} 권한 거부 또는 차단됨.`);
            showPermissionAlert(permissionType);
            break;
        default:
            console.log(`${permissionType} 권한 상태를 알 수 없습니다.`);
    }
};

// 권한 알림 표시 함수
const showPermissionAlert = (permissionType) => {
    Alert.alert(
        `${permissionType} 권한 필요`,
        `${permissionType} 권한이 필요합니다. 설정으로 이동하여 권한을 허용하세요.`,
        [
            { text: '취소', style: 'cancel' },
            { text: '설정으로 이동', onPress: () => Linking.openSettings() },
        ],
        { cancelable: true }
    );
};

// PushNotification 초기화 및 권한 설정
export const initializePushNotifications = async () => {
    console.log('Initializing Push Notifications...');

    const permission = await requestNotificationPermission();
    if (permission) {
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
                if (Platform.OS === 'ios') {
                    notification.finish(PushNotificationIOS.FetchResult.NoData);
                }
            },
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        });
    }
};
