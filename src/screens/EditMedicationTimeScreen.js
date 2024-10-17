import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native'; // Alert 추가
import SimpleLineIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

const EditMedicationTimeScreen = ({ navigation, route }) => {
    // route.params.alarm이 없을 때 기본값 제공
    const alarm = route.params?.alarm || {
        timing: '식후',
        days: ['월', '화', '수', '목', '금', '토', '일'],
        time: '12:00',
    };

    const [medicationTiming, setMedicationTiming] = useState(alarm.timing);
    const [selectedDays, setSelectedDays] = useState(alarm.days);
    const [hour, setHour] = useState(alarm.time.substring(0, 2));
    const [minute, setMinute] = useState(alarm.time.substring(3, 5));

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

    const saveEditedMedication = () => {
        if (selectedDays.length === 0) { // 요일이 선택되지 않았을 경우
            Alert.alert(
                '요일 선택 필요',
                '알림을 설정하기 위해 적어도 하나의 요일을 선택해주세요.',
                [{ text: '확인' }]
            );
            return; // 저장 중단
        }

        const updatedAlarm = {
            ...alarm,
            timing: medicationTiming,
            days: selectedDays,
            time: `${hour}:${minute}`,
        };

        navigation.navigate('MedicationTime', { updatedAlarm });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.header, styles.shadowProp]}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerText}>투약 시간 수정</Text>
                    <SimpleLineIcons name="pill" size={40} color="#00722E" />
                </View>
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.Title}>투약 시간 수정</Text>
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
                    <Text style={styles.sectionTitle1}>투약 요일</Text>
                    <View style={styles.daysContainer}>
                        {days.map((dayPair, index) => (
                            <View key={index} style={styles.dayPairContainer}>
                                {dayPair.map(day => (
                                    <TouchableOpacity key={day} style={styles.itemRow} onPress={() => toggleDay(day)}>
                                        <View style={[styles.checkbox, (selectedDays.includes(day) || (day === '매일' && selectedDays.length === 7)) && styles.checkedBox]}>
                                            {(selectedDays.includes(day) || (day === '매일' && selectedDays.length === 7)) && <SimpleLineIcons name="check" size={20} color="#fff" />}
                                        </View>
                                        <Text style={styles.itemText}>{day}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </View>
                </View>

                <Text style={styles.sectionTitle2}>투약 시간</Text>
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
                <TouchableOpacity style={styles.button} onPress={saveEditedMedication}>
                    <Text style={styles.buttonText}>저장</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>취소</Text>
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
        width: '86%',
        height: 70,
        alignSelf: 'center',
        marginBottom: 15,
        marginTop: 50,
    },
    headerText: {
        color: '#464646',
        fontWeight: 'bold',
        fontSize: 22,
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
        width: 320,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
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
    Title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        alignSelf: 'center',
        marginTop: -10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 18,
    },
    sectionTitle1: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 18,
        marginTop: 22,
    },
    sectionTitle2: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
        marginBottom: -8,
        marginTop: -10,
        marginRight: 166,
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
        marginBottom: 20,
        gap: 30,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 30,
        width: 80,
    },
    checkbox: {
        width: 34,
        height: 34,
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
        fontSize: 20,
        marginBottom: 5,
        fontWeight: 'bold',
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
        fontSize: 20,
        marginHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    button: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 10,
        width: '46%',
        height: 70,
        backgroundColor: '#FCBAAA',
        borderRadius: 10,
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
    },
});

export default EditMedicationTimeScreen;
