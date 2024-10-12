import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Dimensions, Animated, Alert } from 'react-native';
import Test from '../assets/images/loading.png';
import axios from 'axios';
import { REACT_APP_API_KEY } from '@env';
import * as Keychain from 'react-native-keychain';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [memberCode, setMemberCode] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const saveToKeychain = async (accessToken) => {
        try {
            await Keychain.setGenericPassword('token', accessToken);
            console.log('Access token saved successfully to Keychain');
        } catch (error) {
            console.error('Error saving to Keychain:', error);
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
                validateStatus: function (status) {
                    return status >= 200 && status < 300;
                },
            });

            console.log('로그인 성공:', response.data);
            console.log('응답 헤더:', response.headers);



            // 헤더에서 토큰 찾기
            const accessToken = response.headers['authorization']


            if (accessToken) {
                await saveToKeychain(accessToken);
                console.log('인증 토큰이 키체인에 저장되었습니다.');
                console.log(accessToken)
            } else {
                console.warn('로그인 응답에서 인증 토큰을 찾을 수 없습니다.');
                console.log('전체 응답:', response);
            }

            // 메인 화면으로 이동
            navigation.replace('Main');
        }catch (error) {
            console.error('로그인 실패:', error);
            if (error.response) {
                // 서버가 2xx 범위를 벗어나는 상태 코드로 응답한 경우
                console.error('응답 데이터:', error.response.data);
                console.error('응답 상태:', error.response.status);
                console.error('응답 헤더:', error.response.headers);
            } else if (error.request) {
                // 요청이 이루어졌으나 응답을 받지 못한 경우
                console.error('요청:', error.request);
            } else {
                // 요청을 설정하는 중에 문제가 발생한 경우
                console.error('에러 메시지:', error.message);
            }
            Alert.alert('로그인 실패', '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
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
                        keyboardType="default"
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
