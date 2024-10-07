import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Platform, Dimensions } from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesomeIcons from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HelpRequestModal from '../components/HelpRequestModal'; // 추가

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const MainScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const userName = "고세동"; // 임시 데이터
    const guardianName = "윤영하"; // 임시 데이터
    const adminName = "역삼2동 최고민수 주무관"; // 임시 데이터
    const alarmCount = 41; // 임시 알람 수 데이터

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
                    <Image source={require('../assets/images/bell-grey.png')} style={styles.bellIcon} />
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
                <Image source={require('../assets/images/appIcon.png')} style={styles.icon} />
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
                                <FontAwesomeIcons name="hand-paper-o" size={90} color={'#ffffff'} style={{ marginTop: 10 }} />
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
                            <MaterialCommunityIcons name="pill" size={60} color={'#00722E'} />
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rowButton, styles.shadowProp]} onPress={() => navigation.navigate('NearbyMedicalFacilities')}>
                    <View style={styles.buttonContent}>
                        <View style={styles.buttonTextContainer}>
                            <Text style={styles.buttonText2}>근처</Text>
                            <Text style={styles.buttonText2}>병원/약국</Text>
                        </View>
                        <View style={[styles.buttonIcon, { margin: -10 }]}>
                            <MaterialCommunityIcons name="hospital" size={90} color={'#00722E'} />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 알림 내역 조회 버튼 */}
            <View style={styles.alarmHistoryContainer}>
                <TouchableOpacity style={[styles.alarmHistoryButton, styles.shadowProp]} onPress={() => navigation.navigate('AlarmList')}>
                    <View style={styles.alarmHistoryContent}>
                        <Text style={styles.alarmHistoryText}>알림 내역 조회</Text>
                        <Image source={require('../assets/images/bell-yellow.png')} style={styles.bellIcon} />
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
        marginTop: 10,
        marginBottom: -50,
    },
    bellIcon: {
        width: 34,
        height: 44,
        resizeMode: 'contain',
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
        top: 6,
        backgroundColor: 'red',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 14,
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
        fontSize: 44,
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
        width: 140,
        height: 170,
        marginLeft: -4,
    },
    guardianInfo: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        marginBottom: 20,
        alignSelf: 'center',
    },
    guardianInfoText: {
        color: '#464646',
        fontWeight: 'bold',
        fontSize: 20,
    },
    helpButtonContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    helpButton: {
        backgroundColor: '#FCBAAA',
        padding: 6,
        borderRadius: 10,
        width: '90%',
        height: 170,
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
        gap: 74,
        marginTop: 20,
    },
    helpButtonBottomRow: {
        flex: 1,
        alignSelf: 'flex-start',
        marginLeft: 15,
        marginTop: -30,
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
        height: 150,
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
        marginTop: -14,
    },
    alarmHistoryContainer: {
        alignItems: 'center',
    },
    alarmHistoryButton: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: 332,
        height: 120,
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
        fontSize: 24,
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
        fontSize: 20,
    },
    buttonText2: {
        color: '#464646',
        fontWeight: 'bold',
        fontSize: 23,
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
