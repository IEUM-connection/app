import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Dimensions, Animated, Alert } from 'react-native';
import Test from '../assets/images/loading.png';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import { REACT_APP_API_KEY } from '@env';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [memberCode, setMemberCode] = useState('');
    const [fcmToken, setFcmToken] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // FCM 토큰 가져오기
        getFcmToken();

        // 로고 애니메이션
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const getFcmToken = async () => {
        try {
            const token = await messaging().getToken();
            setFcmToken(token);
        } catch (error) {
            console.error('FCM 토큰 가져오기 실패:', error);
        }
    };

    const handleLogin = async () => {
        if (memberCode.length !== 6) {
            Alert.alert('오류', '올바른 6자리 인증번호를 입력해주세요.');
            return;
        }

        try {
            const response = await axios.post(`${REACT_APP_API_KEY}/auth/login`, {
                memberCode
            }, {
                headers: {
                    'loginType': 'member',
                },
            });

            console.log('로그인 성공:', response.data);

            // FCM 토큰 서버로 전송
            if (fcmToken) {
                try {
                    await axios.post(`${REACT_APP_API_KEY}/members/1/fcm-token`, {
                        fcmToken: fcmToken
                    }, {
                        headers: {
                            'Authorization': `Bearer ${response.data.token}`
                        }
                    });
                    console.log('FCM 토큰 업데이트 성공');
                } catch (error) {
                    console.error('FCM 토큰 업데이트 실패:', error);
                }
            }

            navigation.replace('Main');
        } catch (error) {
            console.error('로그인 실패:', error);
            Alert.alert('로그인 실패', error.response?.data?.message || '알 수 없는 오류가 발생했습니다.');
        }
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.contentContainer}>
                <Animated.Image
                    source={Test}
                    style={[styles.image, { opacity: fadeAnim }]}
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="인증번호 입력"
                        placeholderTextColor="#9A9A9A"
                        value={memberCode}
                        onChangeText={setMemberCode}
                        textAlign="center"
                        keyboardType="numeric"
                        maxLength={6}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                    >
                        <Text style={styles.buttonText}>들어가기</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.copyrightContainer}>
                <Text style={styles.copyrightText}>
                    Copyright 2024. 이음(i2um.Connection@gmail.com){"\n"}All pictures cannot be copied without permission.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingTop: windowHeight * 0.15,
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    input: {
        height: 70,
        borderColor: '#9A9A9A',
        backgroundColor: '#EEEEEE',
        marginBottom: 12,
        width: windowWidth - 110,
        borderRadius: 10,
        color: 'black',
        fontSize: 20,
        textAlign: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    button: {
        height: 70,
        backgroundColor: '#FCBAAA',
        justifyContent: 'center',
        alignItems: 'center',
        width: windowWidth - 110,
        borderRadius: 10,
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    image: {
        width: windowWidth * 0.8,
        height: windowHeight * 0.3,
        resizeMode: 'contain',
    },
    copyrightText: {
        fontSize: 12,
        color: '#9A9A9A',
        marginTop: 10,
    },
    copyrightContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
});

export default LoginScreen;
