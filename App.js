import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native'; // 네비게이션 컨테이너 임포트
import { createStackNavigator } from '@react-navigation/stack'; // 스택 네비게이터 생성
import { SafeAreaProvider } from 'react-native-safe-area-context'; // 안전한 영역 제공자 임포트
import {
    requestExactAlarmPermission,
    initializePushNotifications,
    requestNotificationPermission,
    initializePermissions,
} from './src/utils/alarmUtils'; // 알람 관련 유틸리티 함수들 임포트
import { setupUsageTracking, stopUsageTracking } from './src/utils/usageTracker'; // 사용량 추적 유틸리티 함수들 임포트
import * as fcmUtils from './src/utils/fcmUtils'; // FCM 관련 유틸리티 함수들 임포트

// 화면 컴포넌트 임포트
import LoadingScreen from './src/screens/LoadingScreen';
import MainScreen from './src/screens/MainScreen';
import LoginScreen from './src/screens/LoginScreen';
import AlarmListScreen from './src/screens/AlarmListScreen';
import NearbyMedicalFacilitiesScreen from './src/screens/NearbyMedicalFacilitiesScreen';
import MedicationTimeScreen from './src/screens/MedicationTimeScreen';
import AddMedicationTimeScreen from './src/screens/AddMedicationTimeScreen';
import EditMedicationTimeScreen from './src/screens/EditMedicationTimeScreen';
import {LogBox} from 'react-native';

const Stack = createStackNavigator(); // 스택 네비게이터 생성
LogBox.ignoreLogs([
    '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method.',
    '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method.',
]);
const App = () => {
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리
    const [fcmToken, setFcmToken] = useState(null); // FCM 토큰 상태 관리
    const navigationRef = useRef(); // 네비게이션 레퍼런스 생성

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // FCM 및 Notifee 초기화
                await fcmUtils.initializeNotifee(); // Notifee 초기화 및 채널 생성
                await fcmUtils.requestUserPermission(); // 사용자에게 푸시 알림 권한 요청
                const token = await fcmUtils.getFcmToken(); // FCM 토큰 가져오기
                setFcmToken(token); // FCM 토큰 상태 업데이트
                console.log('FCM Token:', token);

                // 기존 초기화 작업
                await initializePushNotifications(); // 푸시 알림 초기화
                await initializePermissions(); // 권한 초기화
                await requestExactAlarmPermission(); // 정확한 알람 권한 요청
                await requestNotificationPermission(); // 알림 권한 요청
                await setupUsageTracking(); // 사용량 추적 설정

                // 로딩 시뮬레이션 (필요한 경우 제거 가능)
                await new Promise(resolve => setTimeout(resolve, 2000));

                setIsLoading(false); // 로딩 완료
            } catch (error) {
                console.error('Error during app initialization:', error);
                setIsLoading(false); // 오류 발생 시에도 로딩 완료로 설정
            }
        };

        initializeApp(); // 앱 초기화 함수 호출

        // FCM 리스너 설정
        const unsubscribeFcm = fcmUtils.setupFcmListeners(navigationRef); // FCM 리스너 설정 및 구독 해제 함수 받기

        // 컴포넌트 언마운트 시 정리 작업
        return () => {
            stopUsageTracking(); // 사용량 추적 중지
            if (unsubscribeFcm && typeof unsubscribeFcm === 'function') {
                unsubscribeFcm(); // FCM 리스너 구독 해제
            }
        };
    }, []);

    if (isLoading) {
        // 로딩 중이면 로딩 화면 표시
        return <LoadingScreen />;
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }} // 헤더 숨기기
                    />
                    <Stack.Screen
                        name="Main"
                        component={MainScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="AlarmList"
                        component={AlarmListScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="NearbyMedicalFacilities"
                        component={NearbyMedicalFacilitiesScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="MedicationTime"
                        component={MedicationTimeScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="AddMedicationTime"
                        component={AddMedicationTimeScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="EditMedicationTime"
                        component={EditMedicationTimeScreen}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
};

export default App;
