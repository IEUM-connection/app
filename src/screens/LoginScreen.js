import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Text, Dimensions, Animated } from 'react-native'; // 여기서 Image를 대문자로 수정
import Test from '../assets/images/loading.png';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current; // 애니메이션 값 초기화

    const handleLogin = () => {
        console.log('로그인한 사용자 인증 번호:', username);
        navigation.replace('Main');
    };

    useEffect(() => {
        // 로고가 나타나는 애니메이션 시작
        Animated.timing(fadeAnim, {
            toValue: 1, // 최종 값
            duration: 1000, // 애니메이션 지속 시간
            useNativeDriver: true, // 네이티브 드라이버 사용
        }).start();
    }, [fadeAnim]);

    return (
        <View style={styles.mainContainer}>
            <View style={styles.contentContainer}>
                <Image 
                    source={Test}
                    style={styles.image} // 로고에 애니메이션 적용
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input} // 입력 필드의 스타일
                        placeholder="인증번호 입력" // 입력 필드에 표시되는 텍스트
                        placeholderTextColor="#9A9A9A" // placeholder의 텍스트 색상
                        value={username} // 입력값
                        onChangeText={setUsername} // 입력값이 변경될 때마다 호출
                        textAlign="center" // 입력 텍스트를 가운데 정렬
                        keyboardType="numeric" // 키보드 타입을 숫자로 지정
                        maxLength={6} // 최대 6자리까지 입력 가능
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
        paddingTop: windowHeight * 0.15, // 화면 높이의 15%만큼 상단 패딩을 줍니다.
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
        width: windowWidth - 110, // 화면 너비에서 150을 뺀 만큼의 너비를 가집니다.
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
        elevation: 4, // Android에서의 그림자 효과
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
        width: windowWidth * 0.8, // 화면 너비의 80%
        height: windowHeight * 0.3, // 화면 높이의 30%
        resizeMode: 'contain', // 이미지의 비율을 유지하면서 주어진 영역에 맞춥니다.
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