import React, { useState, useCallback } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Platform, ScrollView, Alert } from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

const MedicationTimeScreen = ({ navigation, route }) => {
    const [alarms, setAlarms] = useState([]);

    const saveAlarmsToStorage = async (alarms) => {
        try {
            await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
        } catch (error) {
            console.error('Failed to save alarms:', error);
        }
    };

    const loadAlarmsFromStorage = async () => {
        try {
            const savedAlarms = await AsyncStorage.getItem('alarms');
            if (savedAlarms) {
                return JSON.parse(savedAlarms);
            }
            return [];
        } catch (error) {
            console.error('Failed to load alarms:', error);
            return [];
        }
    };

    const scheduleAlarm = (alarm) => {
        const [hour, minute] = alarm.time.split(':').map(Number);
        const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

        // 테스트를 위한 즉시 알람
        console.log('Test notification sent immediately');

        // 실제 예약 알람
        alarm.days.forEach(day => {
            const dayIndex = daysOfWeek.indexOf(day);
            if (dayIndex !== -1) {
                const now = new Date();
                let alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

                if (dayIndex > now.getDay() || (dayIndex === now.getDay() && alarmTime > now)) {
                    alarmTime.setDate(now.getDate() + (dayIndex - now.getDay()));
                } else {
                    alarmTime.setDate(now.getDate() + (7 + dayIndex - now.getDay()));
                }

                PushNotification.localNotificationSchedule({
                    channelId: "medication-channel",
                    message: `${alarm.timing} 투약 시간입니다`,
                    date: alarmTime,
                    repeatType: 'week',
                    repeatTime: 1,
                    allowWhileIdle: true,
                    importance: "high",
                    priority: "high",
                });
                console.log(`Alarm scheduled for ${alarm.timing} at ${alarmTime.toLocaleString()} (${day})`);
            }
        });
    };

    const cancelAlarm = (alarmId) => {
        PushNotification.cancelLocalNotification(alarmId.toString());
        console.log(`Alarm ${alarmId} cancelled`);
    };

    const addAlarm = useCallback((newAlarm) => {
        setAlarms(prevAlarms => {
            const updatedAlarms = [...prevAlarms, { ...newAlarm, id: Date.now().toString() }];
            saveAlarmsToStorage(updatedAlarms);
            scheduleAlarm(newAlarm);
            return updatedAlarms;
        });
    }, []);

    const updateAlarm = useCallback((updatedAlarm) => {
        setAlarms(prevAlarms => {
            const updatedAlarms = prevAlarms.map(alarm =>
                alarm.id === updatedAlarm.id ? updatedAlarm : alarm
            );
            saveAlarmsToStorage(updatedAlarms);
            return updatedAlarms;
        });
    }, []);

    const removeAlarm = useCallback((alarmId) => {
        setAlarms(prevAlarms => {
            const updatedAlarms = prevAlarms.filter(alarm => alarm.id !== alarmId);
            saveAlarmsToStorage(updatedAlarms);
            cancelAlarm(alarmId);
            return updatedAlarms;
        });
    }, []);

    useFocusEffect(
        useCallback(() => {
            const loadAlarms = async () => {
                const loadedAlarms = await loadAlarmsFromStorage();
                setAlarms(loadedAlarms);
                loadedAlarms.forEach(scheduleAlarm);
            };
            loadAlarms();

            if (route.params?.newAlarm) {
                addAlarm(route.params.newAlarm);
                navigation.setParams({ newAlarm: undefined });
            } else if (route.params?.updatedAlarm) {
                updateAlarm(route.params.updatedAlarm);
                navigation.setParams({ updatedAlarm: undefined });
            }
        }, [route.params, addAlarm, updateAlarm])
    );

    const navigateToAddMedicationTime = () => {
        navigation.navigate('AddMedicationTime');
    };

    const navigateToEditMedicationTime = (alarm) => {
        navigation.navigate('EditMedicationTime', { alarm });
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, styles.shadowProp]}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerText}>투약 시간 알림</Text>
                    <SimpleLineIcons name="pill" size={40} color="#00722E" />
                </View>
            </View>
            {alarms.length === 0 ? (
                <View style={[styles.noAlarmContent, styles.shadowProp]}>
                    <Text style={styles.noAlarmText}>등록된 투약알림이 없습니다.</Text>
                    <Text style={styles.noAlarmText}>투약알림을 등록해주세요.</Text>
                </View>
            ) : (
                <ScrollView style={styles.alarmsScrollView}>
                    {alarms.map((alarm) => (
                        <View key={alarm.id} style={[styles.alarmContent, styles.shadowProp]}>
                            <View style={styles.alarmInfo}>
                                <Text style={styles.alarmTitle}>내 투약 시간</Text>
                                <Text style={styles.alarmInfoText}>
                                    투약 정보: <Text style={styles.redBoldText}>{alarm.timing}</Text>
                                </Text>
                                <Text style={styles.alarmInfoText}>
                                    투약 요일: <Text style={styles.redBoldText}>
                                    {alarm.days.length === 7 ? '매일' : alarm.days.join(', ')}
                                </Text>
                                </Text>
                                <Text style={styles.alarmInfoText}>투약 시간: <Text style={styles.redBoldText}>{alarm.time.substring(0, 2)}</Text> 시{' '}
                                    <Text style={styles.redBoldText}>{alarm.time.substring(3, 5)}</Text> 분 </Text>

                            </View>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.editButton, styles.shadowProp]}
                                    onPress={() => navigateToEditMedicationTime(alarm)}>
                                    <Text style={styles.buttonText}>변경</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.removeButton, styles.shadowProp]}
                                    onPress={() => removeAlarm(alarm.id)}
                                >
                                    <Text style={styles.buttonText}>삭제</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.Button, styles.shadowProp]}
                    onPress={navigateToAddMedicationTime}>
                    <Text style={styles.ButtonText}>등록</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Main')}
                                  style={[styles.Button, styles.shadowProp]}>
                    <Text style={styles.ButtonText}>닫기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#fff',
        paddingRight: 30,
        paddingLeft: 30,
        borderRadius: 10,
        width: '86%',
        height: 70,
        alignSelf: 'center',
        marginBottom: 15,
        marginTop: 50,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },
    headerText: {
        color: '#464646',
        fontWeight: 'bold',
        fontSize: 22,
    },
    noAlarmContent: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#C9C9C9',
        width: 320,
        height: 320,
        borderRadius: 10,
        margin: 70,
        marginBottom: 117,
    },
    noAlarmText: {
        fontSize: 22,
        color: '#ffffff',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    alarmsScrollView: {
        width: 320,
        height: '60%',
        borderRadius: 10,
    },
    alarmContent: {
        backgroundColor: '#F2F2F2',
        padding: 15,
        borderRadius: 10,
        marginBottom: 30,
    },
    alarmTitle: {
        alignSelf: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 28,
    },
    alarmInfo: {
        padding: 15,
        borderRadius: 10,
    },
    alarmInfoText: {
        fontSize: 25,
        marginBottom: 10,
    },
    redBoldText: {
        color: '#CA4C4C',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 10,
        marginTop: 20,
    },
    shadowProp: {
        ...Platform.select({
            android: {
                elevation: 5,
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
        }),
    },
    Button: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        width: 154,
        height: 114,
        backgroundColor: '#FCBAAA',
        borderRadius: 10,
        marginBottom: 50
    },
    editButton: {
        justifyContent: 'center',
        backgroundColor: '#B4B0B0',
        padding: 10,
        borderRadius: 5,
        marginRight: 5,
        width: '46%',
        height: 70,
        marginBottom: 16,
    },
    ButtonText: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    removeButton: {
        justifyContent: 'center',
        backgroundColor: '#FF6B6B',
        padding: 10,
        borderRadius: 5,
        width: '46%',
        marginLeft: 5,
        height: 70,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 5,
    },
});

export default MedicationTimeScreen;
