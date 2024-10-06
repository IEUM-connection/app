import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Platform } from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesomeIcons from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HelpRequestModal from '../components/HelpRequestModal'; // 추가

const MainScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const userName = "고세동"; // 임시 데이터
    const guardianName = "윤영하"; // 임시 데이터
    const adminName = "역삼2동 최고민수 주무관"; // 임시 데이터
    const alarmCount = 100; // 임시 알람 수 데이터

    const handleHelpRequest = () => {
        setModalVisible(false);
        // 여기서 도움 요청 처리 로직을 추가합니다.
        console.log('도움이 요청되었습니다.');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 영역 */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('AlarmList')}>
                    <SimpleLineIcons name="bell" size={35} color={'#777777'} />
                    {alarmCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{alarmCount > 99 ? '99+' : alarmCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* 사용자 정보 */}
            <View style={styles.userInfo}>
                <View style={styles.userNameContainer}>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userNameSuffix}>님과의</Text>
                </View>
                <Image source={require('../assets/images/이음아이콘.png')} style={styles.icon} />
            </View>

            {/* 보호자 및 담당자 정보 */}
            <View style={[styles.guardianInfo, styles.shadowProp]}>
                <Text style={styles.guardianInfoText}>보호자:  {guardianName}</Text>
                <Text style={styles.guardianInfoText}>담당자:  {adminName}</Text>
            </View>

            {/* 도움 요청 버튼 */}
            <View style={styles.helpButtonContainer}>
                <TouchableOpacity
                    style={[styles.helpButton, styles.shadowProp]}
                    onPress={() => setModalVisible(true)}
                >
                    <View style={styles.helpButtonContent}>
                        <View style={styles.helpButtonTopRow}>
                            <View style={styles.helpButtonTextContainer}>
                                <Text style={styles.buttonText}>도움요청</Text>
                                <FontAwesomeIcons name="hand-paper-o" size={80} color={'#ffffff'} style={{ marginTop: 10 }} />
                            </View>
                        </View>
                        <View style={styles.helpButtonBottomRow}>
                            <Text style={styles.buttonText1}>보호자에게 도움 요청하기</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 도움 요청 모달 */}
            <HelpRequestModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onRequestHelp={handleHelpRequest}
            />

            {/* 하단 버튼들 */}
            <View style={styles.rowButtonContainer}>
                <TouchableOpacity style={[styles.rowButton, styles.shadowProp]} onPress={() => navigation.navigate('MedicationTime')}>
                    <View style={styles.buttonContent}>
                        <View style={styles.buttonTextContainer}>
                            <Text style={styles.buttonText2}>투약</Text>
                            <Text style={styles.buttonText2}>시간 알람</Text>
                        </View>
                        <View style={styles.buttonIcon}>
                            <MaterialCommunityIcons name="pill" size={50} color={'#00722E'} />
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rowButton, styles.shadowProp]} onPress={() => navigation.navigate('NearbyMedicalFacilities')}>
                    <View style={styles.buttonContent}>
                        <View style={styles.buttonTextContainer}>
                            <Text style={styles.buttonText2}>근처</Text>
                            <Text style={styles.buttonText2}>병원/약국</Text>
                        </View>
                        <View style={[styles.buttonIcon, { margin: -15 }]}>
                            <MaterialCommunityIcons name="hospital" size={75} color={'#00722E'} />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 알림 내역 조회 버튼 */}
            <View style={styles.alarmHistoryContainer}>
                <TouchableOpacity style={[styles.alarmHistoryButton, styles.shadowProp]} onPress={() => navigation.navigate('AlarmList')}>
                    <View style={styles.alarmHistoryContent}>
                        <Text style={styles.alarmHistoryText}>알림 내역 조회</Text>
                        <SimpleLineIcons name="bell" size={40} color={'#ffeb00'} />
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default MainScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    header: {
        alignItems: 'flex-end',
        marginTop: 20,
        marginBottom: -30,
    },
    notificationButton: {
        padding: 10,
        paddingRight: 20,
        borderRadius: 5,
        position: 'relative',
        transform: [{ scaleX: 1.1 }],
    },
    badge: {
        position: 'absolute',
        left: 28,
        top: 2,
        backgroundColor: 'red',
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        paddingHorizontal: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -30,
    },
    userNameContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#585858',
    },
    userNameSuffix: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 5,
        color: '#585858',
    },
    icon: {
        width: 150,
        height: 170,
        marginLeft: -10,
    },
    guardianInfo: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        marginBottom: 15,
        alignSelf: 'center',
    },
    guardianInfoText: {
        color: '#464646',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
        marginBottom: 5,
    },
    helpButtonContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    helpButton: {
        backgroundColor: '#FCBAAA',
        padding: 15,
        borderRadius: 10,
        width: '90%',
        height: 210,
    },
    helpButtonContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    helpButtonTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: '90%',
    },
    helpButtonTextContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        gap: 60,
        marginTop: 10,
    },
    helpButtonBottomRow: {
        flex: 1,
        alignSelf: 'flex-start',
        marginLeft: 20,
        marginTop: -20,
    },
    rowButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 20,
    },
    rowButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        width: 155,
        height: 155,
    },
    buttonContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    buttonTextContainer: {
        alignItems: 'flex-start',
        paddingTop: 10,
    },
    buttonIcon: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    alarmHistoryContainer: {
        alignItems: 'center',
    },
    alarmHistoryButton: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        width: '90%',
        height: 70,
    },
    alarmHistoryContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },
    alarmHistoryText: {
        color: '#464646',
        fontWeight: 'bold',
        fontSize: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 36,
        marginLeft: 15,
    },
    buttonText1: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    buttonText2: {
        color: '#464646',
        fontWeight: 'bold',
        fontSize: 20,
        marginLeft: 10,
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
});
