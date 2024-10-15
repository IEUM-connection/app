import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    Platform,
    Dimensions,
    ActivityIndicator,
    AppState
} from 'react-native';
import FontAwesomeIcons from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HelpRequestModal from '../components/HelpRequestModal';
import LogoutModal from '../components/LogoutModal';
import axios from 'axios';
import { REACT_APP_API_KEY } from '@env';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventEmitter from '../utils/EventEmitter';
import {
    requestUserPermission,
    getFcmToken,
    initializeNotifee,
    setupFcmListeners
} from '../utils/fcmUtils';
import auth from '@react-native-firebase/auth';

// 화면 크기 가져오기
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const MainScreen = ({ navigation }) => {
    // 상태 변수들
    const [modalVisible, setModalVisible] = useState(false); // 도움 요청 모달 표시 여부
    const [logoutModalVisible, setLogoutModalVisible] = useState(false); // 로그아웃 모달 표시 여부
    const [userData, setUserData] = useState(null); // 사용자 데이터
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [notificationCount, setNotificationCount] = useState(0); // 알림 개수

    // 알림 개수 업데이트 함수
    const updateNotificationCount = useCallback(async () => {
        try {
            const count = await AsyncStorage.getItem('notificationCount');
            setNotificationCount(Number(count) || 0);
        } catch (error) {
            console.error('알림 카운트 가져오기 실패:', error);
        }
    }, []);

    // 알림 개수 증가 함수
    const incrementNotificationCount = useCallback(async () => {
        try {
            const currentCount = await AsyncStorage.getItem('notificationCount');
            const newCount = (Number(currentCount) || 0) + 1;
            await AsyncStorage.setItem('notificationCount', newCount.toString());
        } catch (error) {
            console.error('알림 카운트 증가 실패:', error);
        }
    }, []);

    // 알림 개수 리셋 함수
    const resetNotificationCount = useCallback(async () => {
        try {
            await AsyncStorage.setItem('notificationCount', '0');
            setNotificationCount(0);
        } catch (error) {
            console.error('알림 카운트 리셋 실패:', error);
        }
    }, []);

    // 앱 초기화 및 데이터 로딩
    useEffect(() => {
        let isMounted = true;
        let appStateListener = null;

        const initializeApp = async () => {
            try {
                // FCM 권한 요청
                const hasPermission = await requestUserPermission();
                if (hasPermission) {
                    await initializeNotifee();
                    const token = await getFcmToken();
                    if (token) {
                        console.log("FCM 토큰:", token);
                        await updateFcmToken(token);
                    }
                    setupFcmListeners(navigation, incrementNotificationCount);
                }
                if (isMounted) {
                    await fetchUserData();
                    await updateNotificationCount();
                }
            } catch (error) {
                console.error('앱 초기화 중 오류:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeApp();

        // 앱 상태 변경 리스너 설정
        appStateListener = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                updateNotificationCount();
            }
        });

        // 컴포넌트 언마운트 시 정리
        return () => {
            isMounted = false;
            if (appStateListener && typeof appStateListener.remove === 'function') {
                appStateListener.remove();
            }
        };
    }, [navigation, updateNotificationCount, incrementNotificationCount]);

    // 사용자 데이터 가져오기
    const fetchUserData = async () => {
        try {
            const credentials = await Keychain.getGenericPassword();
            if (!credentials) {
                console.error('인증 토큰이 없습니다.');
                navigation.replace('Login');
                return;
            }
            const accessToken = credentials.password;

            const response = await axios.get(`${REACT_APP_API_KEY}/members/member`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            setUserData(response.data.data);
        } catch (error) {
            console.error('사용자 데이터 가져오기 실패:', error);
        }
    };

    // FCM 토큰 업데이트
    const updateFcmToken = async (fcmToken) => {
        try {
            const credentials = await Keychain.getGenericPassword();
            if (!credentials) {
                console.error('인증 토큰이 없습니다.');
                return;
            }
            const accessToken = credentials.password;

            await axios.post(`${REACT_APP_API_KEY}/members/fcm-token`, {
                fcmToken: fcmToken
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('FCM 토큰 업데이트 성공');
        } catch (error) {
            console.error('FCM 토큰 업데이트 실패:', error);
        }
    };

    // 도움 요청 처리
    const handleHelpRequest = () => {
        setModalVisible(false);
        console.log('도움이 요청되었습니다.');
        // 여기에 실제 도움 요청 로직 추가
    };

    // 알림 카운트 리셋 처리
    const handleResetNotificationCount = async () => {
        await resetNotificationCount();
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            // Keychain에서 토큰 제거
            await Keychain.resetGenericPassword();

            // AsyncStorage에서 알림 카운트 제거
            await AsyncStorage.removeItem('notificationCount');

            // Firebase 로그아웃
            await auth().signOut();

            // 로그인 화면으로 이동
            navigation.replace('Login');
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
            Alert.alert("오류", "로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.");
        }
    };

    // 로딩 중일 때 표시할 화면
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // 메인 화면 렌더링
    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 (알림 아이콘) */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => {
                        navigation.navigate('AlarmList');
                        handleResetNotificationCount();
                    }}
                >
                    <Image source={require('../assets/images/bell-grey.png')} style={styles.bellIcon} />
                    {notificationCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* 사용자 정보 및 로그아웃 버튼 */}
            <View style={styles.userInfo}>
                <View style={styles.userNameContainer}>
                    <Text style={styles.userName}>{userData?.name || '사용자'}</Text>
                    <Text style={styles.userNameSuffix}>님과의</Text>
                </View>
                <TouchableOpacity onPress={() => setLogoutModalVisible(true)}>
                    <Image source={require('../assets/images/appIcon.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>

            {/* 보호자 및 담당자 정보 */}
            <View style={[styles.guardianInfo, styles.shadowProp]}>
                <Text style={styles.guardianInfoText}>보호자: {userData?.guardianName || '정보 없음'}</Text>
                <Text style={styles.guardianInfoText}>담당자: {userData?.adminName || '정보 없음'}</Text>
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

            {/* 로그아웃 모달 */}
            <LogoutModal
                visible={logoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                onLogout={handleLogout}
            />

            {/* 추가 기능 버튼들 */}
            <View style={styles.rowButtonContainer}>
                {/* 투약 시간 알람 버튼 */}
                <TouchableOpacity
                    style={[styles.rowButton, styles.shadowProp]}
                    onPress={() => navigation.navigate('MedicationTime')}
                >
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
                {/* 근처 병원 버튼 */}
                <TouchableOpacity
                    style={[styles.rowButton, styles.shadowProp]}
                    onPress={() => navigation.navigate('NearbyMedicalFacilities')}
                >
                    <View style={styles.buttonContent}>
                        <View style={styles.buttonTextContainer}>
                            <Text style={styles.buttonText2}>근처</Text>
                            <Text style={styles.buttonText2}>병원</Text>
                        </View>
                        <View style={[styles.buttonIcon, { margin: -10 }]}>
                            <MaterialCommunityIcons name="hospital" size={90} color={'#00722E'} />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 알림 내역 조회 버튼 */}
            <View style={styles.alarmHistoryContainer}>
                <TouchableOpacity
                    style={[styles.alarmHistoryButton, styles.shadowProp]}
                    onPress={() => {
                        navigation.navigate('AlarmList');
                        handleResetNotificationCount();
                    }}
                >
                    <View style={styles.alarmHistoryContent}>
                        <Text style={styles.alarmHistoryText}>알림 내역 조회</Text>
                        <Image source={require('../assets/images/bell-yellow.png')} style={styles.bellIcon} />
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// 스타일 정의
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MainScreen;
