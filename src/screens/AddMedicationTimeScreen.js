import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

const AddMedicationTimeScreen = ({ navigation }) => {
    const [medicationTiming, setMedicationTiming] = useState('식후');
    const [selectedDays, setSelectedDays] = useState(['월', '화', '수', '목', '금', '토', '일']);
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');

    const days = [
        ['월', '화'],
        ['수', '목'],
        ['금', '토'],
        ['일', '매일']
    ];

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const toggleDay = (day) => {
        if (day === '매일') {
            if (selectedDays.length === 7) {
                setSelectedDays([]);
            } else {
                setSelectedDays(['월', '화', '수', '목', '금', '토', '일']);
            }
        } else {
            if (selectedDays.includes(day)) {
                setSelectedDays(selectedDays.filter(d => d !== day));
            } else {
                setSelectedDays([...selectedDays, day]);
            }
        }
    };

    const saveMedication = () => {
        const alarmTime = new Date();
        alarmTime.setHours(hour);
        alarmTime.setMinutes(minute);
        alarmTime.setSeconds(0);

        const newAlarm = {
            id: Date.now().toString(),
            timing: medicationTiming,
            days: selectedDays,
            time: `${hour}:${minute}`,
            alarmTime: alarmTime.getTime()  // timestamp로 변환하여 저장
        };

        navigation.navigate('MedicationTime', { newAlarm });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.header, styles.shadowProp]}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerText}>투약 시간 알림</Text>
                    <SimpleLineIcons name="pill" size={40} color="#00722E" />
                </View>
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.Title}>투약 시간 등록</Text>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>투약 정보</Text>
                <View style={styles.itemContainer}>
                    <View style={styles.itemRow}>
                        <TouchableOpacity
                            style={[styles.checkbox, medicationTiming === '식전' && styles.checkedBox]}
                            onPress={() => setMedicationTiming('식전')}
                        >
                            {medicationTiming === '식전' && <SimpleLineIcons name="check" size={20} color="#fff" />}
                        </TouchableOpacity>
                        <Text style={styles.itemText}>식전</Text>
                    </View>
                    <View style={styles.itemRow}>
                        <TouchableOpacity
                            style={[styles.checkbox, medicationTiming === '식후' && styles.checkedBox]}
                            onPress={() => setMedicationTiming('식후')}
                        >
                            {medicationTiming === '식후' && <SimpleLineIcons name="check" size={20} color="#fff" />}
                        </TouchableOpacity>
                        <Text style={styles.itemText}>식후</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>투약 요일</Text>
                <View style={styles.daysContainer}>
                    {days.map((dayPair, index) => (
                        <View key={index} style={styles.dayPairContainer}>
                            {dayPair.map(day => (
                                <View key={day} style={styles.itemRow}>
                                    <TouchableOpacity
                                        style={[styles.checkbox, (selectedDays.includes(day) || (day === '매일' && selectedDays.length === 7)) && styles.checkedBox]}
                                        onPress={() => toggleDay(day)}
                                    >
                                        {(selectedDays.includes(day) || (day === '매일' && selectedDays.length === 7)) && <SimpleLineIcons name="check" size={20} color="#fff" />}
                                    </TouchableOpacity>
                                    <Text style={styles.itemText}>{day}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </View>
                <Text style={styles.sectionTitle}>투약 시간</Text>
                <View style={styles.timeContainer}>
                    <Picker
                        selectedValue={hour}
                        style={styles.timePicker}
                        onValueChange={(itemValue) => setHour(itemValue)}
                    >
                        {hours.map((h) => (
                            <Picker.Item key={h} label={h} value={h} />
                        ))}
                    </Picker>
                    <Text style={styles.timeColon}>:</Text>
                    <Picker
                        selectedValue={minute}
                        style={styles.timePicker}
                        onValueChange={(itemValue) => setMinute(itemValue)}
                    >
                        {minutes.map((m) => (
                            <Picker.Item key={m} label={m} value={m} />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={saveMedication}>
                    <Text style={styles.buttonText}>등록</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#fff',
        paddingRight: 30,
        paddingLeft: 30,
        borderRadius: 10,
        width: '100%',
        height: 80,
        alignSelf: 'center',
        marginBottom: 15,
        marginTop: 60,
    },
    headerText: {
        color: '#464646',
        fontWeight: 'bold',
        fontSize: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },
    contentContainer: {
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        padding: 20,
        paddingTop: 30,
        gap: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    Title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
        alignSelf: 'center',
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

    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        gap: 30,
    },
    daysContainer: {
        flexDirection: 'column',
    },
    dayPairContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 30,
        gap: 30,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 30,
        width: 80,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkedBox: {
        backgroundColor: '#FF9999',
        borderColor: '#FF9999',
    },
    itemText: {
        fontSize: 16,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timePicker: {
        width: 100,
        height: 50,
    },
    timeColon: {
        fontSize: 24,
        marginHorizontal: 10,
    },
    buttonContainer: {
        padding: 20,
    },
    button: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 10,
        width: 200,
        height: 100,
        backgroundColor: '#FCBAAA',
        borderRadius: 10,
        marginBottom: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
    },
});

export default AddMedicationTimeScreen;
