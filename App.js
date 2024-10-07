import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { requestExactAlarmPermission, initializePushNotifications, requestNotificationPermission } from './src/utils/alarmUtils';

import LoadingScreen from './src/screens/LoadingScreen';
import MainScreen from './src/screens/MainScreen';
import LoginScreen from './src/screens/LoginScreen';
import AlarmListScreen from './src/screens/AlarmListScreen';
import NearbyMedicalFacilitiesScreen from './src/screens/NearbyMedicalFacilitiesScreen';
import MedicationTimeScreen from './src/screens/MedicationTimeScreen';
import AddMedicationTimeScreen from './src/screens/AddMedicationTimeScreen';
import EditMedicationTimeScreen from './src/screens/EditMedicationTimeScreen';

const Stack = createStackNavigator();

const App = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // 푸시 알림 초기화
                await initializePushNotifications();

                // 정확한 알람 권한 요청 (Android)
                await requestExactAlarmPermission();

                // 알림 권한 요청 (Android 13+)
                await requestNotificationPermission();

                // 초기 로딩 작업 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 2000));

                setIsLoading(false);
            } catch (error) {
                console.error('Error during app initialization:', error);
                setIsLoading(false);
            }
        };

        initializeApp();
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
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